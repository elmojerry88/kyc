import { Injectable, UnprocessableEntityException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycSubmission } from '../database/entities/kyc-submission.entity';
import { StorageService } from '../storage/storage.service';
import { runKycAgent, KycInput } from '@kyc/agent';
import { SubmitKycDto } from './dto/submit-kyc.dto';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KycSubmission)
    private kycRepository: Repository<KycSubmission>,
    private storageService: StorageService,
  ) {}

  async submitKyc(
    dto: SubmitKycDto,
    files: {
      bi_frente: Express.Multer.File[];
      bi_verso: Express.Multer.File[];
      selfie: Express.Multer.File[];
    },
  ) {
    const startTime = performance.now();
    this.logger.log(`Starting KYC submission process for NIF: ***${dto.nif.slice(-3)}`);

    // Save to DB initially as PENDING
    const newSubmission = this.kycRepository.create({
      nome: dto.nome,
      data_nascimento: new Date(dto.data_nascimento.split('/').reverse().join('-')),
      nif: dto.nif,
      status: 'PENDING',
      bi_frente_key: '',
      bi_verso_key: '',
      selfie_key: '',
    });

    const savedSubmission = await this.kycRepository.save(newSubmission);
    const submissionId = savedSubmission.id;

    // Upload files to MinIO
    const bucket = this.storageService.getBucketName();
    const biFrenteFile = files.bi_frente[0];
    const biVersoFile = files.bi_verso[0];
    const selfieFile = files.selfie[0];

    const biFrenteKey = await this.storageService.uploadFile(
      bucket,
      `${submissionId}/bi_frente.jpg`,
      biFrenteFile.buffer,
      biFrenteFile.mimetype,
    );
    const biVersoKey = await this.storageService.uploadFile(
      bucket,
      `${submissionId}/bi_verso.jpg`,
      biVersoFile.buffer,
      biVersoFile.mimetype,
    );
    const selfieKey = await this.storageService.uploadFile(
      bucket,
      `${submissionId}/selfie.jpg`,
      selfieFile.buffer,
      selfieFile.mimetype,
    );

    // Update with keys and mark as PROCESSING
    savedSubmission.bi_frente_key = biFrenteKey;
    savedSubmission.bi_verso_key = biVersoKey;
    savedSubmission.selfie_key = selfieKey;
    savedSubmission.status = 'PROCESSING';
    await this.kycRepository.save(savedSubmission);

    // Retrieve Base64 for the agent
    const biFrenteB64 = await this.storageService.getFileAsBase64(bucket, biFrenteKey);
    const biVersoB64 = await this.storageService.getFileAsBase64(bucket, biVersoKey);
    const selfieB64 = await this.storageService.getFileAsBase64(bucket, selfieKey);

    const agentInput: KycInput = {
      submission_data: {
        nome: dto.nome,
        data_nascimento: dto.data_nascimento,
        nif: dto.nif,
      },
      images_base64: {
        bi_frente: biFrenteB64,
        bi_verso: biVersoB64,
        selfie: selfieB64,
      },
    };

    // Call LangChain Agent
    this.logger.log(`[Submissão ${submissionId}] Iniciando Agent...`);
    const agentStartTime = performance.now();
    
    const agentResult = await runKycAgent(agentInput);
    
    const agentDuration = performance.now() - agentStartTime;
    this.logger.log(`[Submissão ${submissionId}] Agent concluido em ${Math.round(agentDuration)}ms com status: ${agentResult.status}`);

    // Update DB with result
    savedSubmission.status = agentResult.status;
    savedSubmission.agent_result = agentResult;
    await this.kycRepository.save(savedSubmission);

    if (agentResult.status !== 'KYC_APPROVED') {
      const totalDuration = performance.now() - startTime;
      this.logger.log(`[Submissão ${submissionId}] Submissão KYC reprovada em ${Math.round(totalDuration)}ms.`);

      throw new UnprocessableEntityException({
        status: agentResult.status,
        message: agentResult.message,
        details: agentResult.details,
      });
    }

    const totalDuration = performance.now() - startTime;
    this.logger.log(`[Submissão ${submissionId}] Submissão KYC aprovada em ${Math.round(totalDuration)}ms.`);

    return {
      submission_id: submissionId,
      status: agentResult.status,
      message: agentResult.message,
      details: agentResult.details,
    };
  }

  async getSubmission(id: string) {
    const submission = await this.kycRepository.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException(`Submissão com ID ${id} não encontrada.`);
    }
    return submission;
  }
}
