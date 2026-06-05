# Sprint 1: Infraestrutura e Pacote Compartilhado

**Objectivo**: Configurar o ambiente local do docker, bancos de dados, armazenamento local no MinIO e consolidar todos os tipos e esquemas de validação comuns que serão partilhados entre a API, o Agente e o Aplicativo Móvel.

---

## 📋 Lista de Tarefas (ToDo)

### 1. Ambiente Local & Docker Compose
- [ ] Criar/validar o ficheiro `docker-compose.yml` na raiz do projecto.
  - [ ] Configurar serviço `postgres` (imagem `postgres:16-alpine`, base de dados `kyc_db`).
  - [ ] Configurar serviço `minio` (imagem `minio/minio:latest`, portas `9000` e `9001`).
- [ ] Subir o ambiente Docker local (`docker compose up -d`) e validar se ambos os serviços estão operantes.
- [ ] Aceder à consola web do MinIO (porta `9001`) e criar manualmente ou via script de inicialização o bucket `kyc-documents`.

### 2. Pacote Partilhado (`packages/shared`)
- [ ] Configurar `packages/shared/package.json` definindo as dependências básicas (`zod`).
- [ ] Criar o ficheiro de tipos `packages/shared/src/types/kyc.types.ts`:
  - [ ] Definir o tipo `KycStatus` com os estados: `"PENDING" | "PROCESSING" | "KYC_APPROVED" | "KYC_DATA_MISMATCH" | "KYC_FAKE_DOCUMENT" | "KYC_FACE_MISMATCH" | "KYC_NIF_MISMATCH" | "KYC_PROCESSING_ERROR"`.
  - [ ] Definir o interface `BiOcrData` contendo os dados extraídos pelo OCR do BI.
  - [ ] Definir o interface `KycAgentResult` correspondente ao output estruturado final do Agente.
- [ ] Criar o ficheiro de validação `packages/shared/src/schemas/kyc.schema.ts`:
  - [ ] Implementar o esquema Zod para a submissão de KYC (`KycSubmissionSchema`), validando os campos obrigatórios (nome, data de nascimento, número do BI, NIF).
  - [ ] Validar formato do Número de BI Angolano (9 dígitos seguidos de 1 a 2 letras maiúsculas).
- [ ] Exportar todos os tipos e esquemas no `packages/shared/src/index.ts`.
- [ ] Executar o build do pacote `packages/shared` (`pnpm --filter=@kyc/shared build`) para garantir a compilação.

### 3. Modelo de Dados & PostgreSQL
- [ ] Criar o script SQL de criação da tabela `kyc_submissions` conforme especificado no [AGENTS.md](file:///home/betalover/kyc/AGENTS.md).
- [ ] Configurar a ligação inicial do PostgreSQL em `apps/api/.env` e assegurar que as tabelas necessárias podem ser criadas no startup ou via migração.

---

## 🔍 Critérios de Aceitação
- [x] Contentores do PostgreSQL e MinIO a correr localmente sem erros.
- [x] Bucket `kyc-documents` criado no MinIO.
- [x] Pacote `@kyc/shared` compila correctamente e exporta os tipos TypeScript e esquemas Zod.
- [x] O esquema Zod rejeita números de BI fora do formato padrão angolano (ex: `123456789LA0` deve passar; `12345a789` deve falhar).
