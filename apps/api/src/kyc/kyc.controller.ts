import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFiles, UsePipes } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import { SubmitKycDto, ZodValidationPipe } from './dto/submit-kyc.dto';
import { KycSubmissionSchema } from '@kyc/shared';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bi_frente', maxCount: 1 },
      { name: 'bi_verso', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ]),
  )
  @UsePipes(new ZodValidationPipe(KycSubmissionSchema))
  async submitKyc(
    @Body() dto: SubmitKycDto,
    @UploadedFiles()
    files: {
      bi_frente: Express.Multer.File[];
      bi_verso: Express.Multer.File[];
      selfie: Express.Multer.File[];
    },
  ) {
    if (!files?.bi_frente?.length || !files?.bi_verso?.length || !files?.selfie?.length) {
      throw new Error('Todas as 3 imagens são obrigatórias: bi_frente, bi_verso, selfie.');
    }
    return this.kycService.submitKyc(dto, files);
  }

  @Get('submission/:id')
  async getSubmission(@Param('id') id: string) {
    return this.kycService.getSubmission(id);
  }
}
