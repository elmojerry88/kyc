# Sprint 4: API Backend (NestJS & Orquestração)

**Objectivo**: Desenvolver o backend NestJS completo, integrando a base de dados PostgreSQL, o armazenamento de imagens no MinIO, a recepção de uploads via multipart/form-data, e a invocação síncrona do Agente de KYC.

---

## 📋 Lista de Tarefas (ToDo)

### 1. Configuração do Projecto Backend (`apps/api`)
- [ ] Configurar o ficheiro `.env` em `apps/api` com as chaves para PostgreSQL, MinIO, Anthropic/OpenAI e Firecrawl.
- [ ] Configurar o NestJS para ler variáveis de ambiente utilizando o `@nestjs/config`.
- [ ] Configurar a ligação do TypeORM com PostgreSQL em `apps/api/src/database/`.

### 2. Entidade de Submissão (`kyc-submission.entity.ts`)
- [ ] Criar o ficheiro `apps/api/src/database/entities/kyc-submission.entity.ts`.
- [ ] Definir a tabela `kyc_submissions` com colunas para:
  - [ ] `id` (UUID auto-gerado).
  - [ ] `nome`, `data_nascimento` (tipo DATE), `numero_bi`, `nif`.
  - [ ] `bi_frente_key`, `bi_verso_key`, `selfie_key` (caminhos no MinIO).
  - [ ] `status` (KycStatus, valor inicial `"PENDING"`).
  - [ ] `agent_result` (tipo JSONB para salvar todo o detalhe do agente).
  - [ ] `created_at` e `updated_at`.

### 3. Serviço de Armazenamento (`storage.service.ts`)
- [ ] Instalar e configurar a dependência do MinIO SDK (`minio`).
- [ ] Criar o `StorageModule` e `StorageService` em `apps/api/src/storage/`.
- [ ] Implementar a função `uploadFile(bucketName: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string>`.
- [ ] Implementar a função `getFileAsBase64(bucketName: string, objectName: string): Promise<string>` para converter ficheiros armazenados em strings base64 para o Agente.

### 4. Controlador de KYC & DTOs
- [ ] Criar a DTO `SubmitKycDto` em `apps/api/src/kyc/dto/submit-kyc.dto.ts` usando class-validator ou validação baseada no schema Zod de `@kyc/shared`.
- [ ] Criar o controlador `kyc.controller.ts`:
  - [ ] Adicionar endpoint `POST /kyc/submit` com interceptor `FileFieldsInterceptor` para ler os campos de upload: `bi_frente`, `bi_verso` e `selfie`.
  - [ ] Adicionar endpoint `GET /kyc/submission/:id` para busca e retorno de logs e status da submissão.

### 5. Lógica de Serviço e Integração com o Agente (`kyc.service.ts`)
- [ ] Criar o ficheiro `apps/api/src/kyc/kyc.service.ts`.
- [ ] Implementar o método `submitKyc(...)`:
  - [ ] Iniciar uma transacção e guardar a submissão com status `"PENDING"`.
  - [ ] Fazer o upload das 3 fotos para o MinIO organizadas sob o directório `{submission_id}/`.
  - [ ] Actualizar o status da submissão para `"PROCESSING"`.
  - [ ] Carregar as fotos em base64 do MinIO.
  - [ ] Invocar a função `runKycAgent(...)` do pacote `@kyc/agent`.
  - [ ] Actualizar a base de dados com o `agent_result` e o `status` retornado pelo agente.
  - [ ] Retornar o resultado ou lançar uma excepção `UnprocessableEntityException` (HTTP 422) correspondente aos estados de erro (`KYC_DATA_MISMATCH`, `KYC_FAKE_DOCUMENT`, `KYC_FACE_MISMATCH`, `KYC_NIF_MISMATCH`) para manter o alinhamento com a API REST.

---

## 🔍 Critérios de Aceitação
- [x] O endpoint `POST /kyc/submit` aceita o upload de ficheiros reais de imagens e preenchimento de campos texto.
- [x] Imagens são armazenadas correctamente no MinIO no formato `{submission_id}/bi_frente.jpg`.
- [x] A base de dados reflecte os estados correctos (`PENDING` -> `PROCESSING` -> status final).
- [x] Tentativas de submissão com dados inválidos ou fotos que falham nos testes de KYC retornam HTTP 422 com o código interno correspondente no corpo da resposta JSON.
- [x] O endpoint `GET /kyc/submission/:id` retorna os detalhes completos da base de dados.
