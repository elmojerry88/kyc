import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as path from 'path';

jest.mock('@kyc/agent', () => {
  return {
    runKycAgent: jest.fn(),
  };
});

import { runKycAgent } from '@kyc/agent';

describe('KycController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getDummyFilePath = (filename: string) => path.join(__dirname, 'assets', filename);

  const makeBaseRequest = () => {
    return request(app.getHttpServer())
      .post('/kyc/submit')
      .field('nome', 'João da Silva')
      .field('data_nascimento', '01/01/1990')
      .field('numero_bi', '123456789LA012')
      .field('nif', '1234567890')
      .attach('bi_frente', getDummyFilePath('bi_frente.jpg'))
      .attach('bi_verso', getDummyFilePath('bi_verso.jpg'))
      .attach('selfie', getDummyFilePath('selfie.jpg'));
  };

  it('Cenário A: Dados e fotos 100% corretos -> Espera-se KYC_APPROVED (201/200)', async () => {
    (runKycAgent as jest.Mock).mockResolvedValue({
      status: 'KYC_APPROVED',
      message: 'Identidade validada com sucesso.',
      details: {},
    });

    const response = await makeBaseRequest().expect(201); // NestJS default for POST is 201

    expect(response.body.status).toBe('KYC_APPROVED');
    expect(runKycAgent).toHaveBeenCalled();
  });

  it('Cenário B: Dados digitados diferem do BI -> Espera-se KYC_DATA_MISMATCH (422)', async () => {
    (runKycAgent as jest.Mock).mockResolvedValue({
      status: 'KYC_DATA_MISMATCH',
      message: 'Os dados submetidos não coincidem.',
      details: {},
    });

    const response = await makeBaseRequest().expect(422);

    expect(response.body.status).toBe('KYC_DATA_MISMATCH');
  });

  it('Cenário C: BI visivelmente adulterado ou inválido -> Espera-se KYC_FAKE_DOCUMENT (422)', async () => {
    (runKycAgent as jest.Mock).mockResolvedValue({
      status: 'KYC_FAKE_DOCUMENT',
      message: 'O documento falhou na validação de autenticidade.',
      details: {},
    });

    const response = await makeBaseRequest().expect(422);

    expect(response.body.status).toBe('KYC_FAKE_DOCUMENT');
  });

  it('Cenário D: Selfie diferente da foto do BI -> Espera-se KYC_FACE_MISMATCH (422)', async () => {
    (runKycAgent as jest.Mock).mockResolvedValue({
      status: 'KYC_FACE_MISMATCH',
      message: 'A selfie não corresponde à fotografia.',
      details: {},
    });

    const response = await makeBaseRequest().expect(422);

    expect(response.body.status).toBe('KYC_FACE_MISMATCH');
  });

  it('Cenário E: NIF associado a outro nome ou não encontrado -> Espera-se KYC_NIF_MISMATCH (422)', async () => {
    (runKycAgent as jest.Mock).mockResolvedValue({
      status: 'KYC_NIF_MISMATCH',
      message: 'O NIF não foi encontrado ou dados não batem.',
      details: {},
    });

    const response = await makeBaseRequest().expect(422);

    expect(response.body.status).toBe('KYC_NIF_MISMATCH');
  });
});
