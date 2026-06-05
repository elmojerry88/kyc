# AGENTS.md — Documentação Técnica do Agente de Validação de Identidade (KYC Angola)

> **Versão:** 1.0.0-MVP  
> **Última actualização:** 2026-06-04  
> **Contexto:** Monorepo — NestJS + React Native + PostgreSQL + MinIO + LangChain + Firecrawl

---

## 1. Visão Geral do Projecto

Este projecto é um sistema de **KYC (Know Your Customer)** adaptado ao contexto angolano. O seu objectivo é validar a identidade de um cidadão de forma automatizada, utilizando um agente de IA que executa OCR, comparação facial, detecção de documentos falsos e verificação junto ao Portal do Contribuinte.

O sistema é composto por:

- **API Backend** (`apps/api`) — NestJS, responsável por receber os dados, orquestrar os agentes e devolver os resultados.
- **App Mobile** (`apps/mobile`) — React Native, interface do utilizador para captura e envio dos dados.
- **Agente de Validação** (`packages/agent`) — LangChain, núcleo de inteligência que coordena as ferramentas de OCR, comparação facial, autenticidade do BI e scraping.
- **Pacotes partilhados** (`packages/shared`) — tipos TypeScript, schemas Zod, utilitários e constantes partilhadas entre apps.

---

## 2. Estrutura do Monorepo

```
/
├── apps/
│   ├── api/                        # Backend NestJS
│   │   ├── src/
│   │   │   ├── kyc/                # Módulo principal de KYC
│   │   │   │   ├── kyc.module.ts
│   │   │   │   ├── kyc.controller.ts
│   │   │   │   ├── kyc.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── submit-kyc.dto.ts
│   │   │   ├── storage/            # Módulo MinIO
│   │   │   │   ├── storage.module.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── database/           # Módulo PostgreSQL / TypeORM
│   │   │   │   ├── database.module.ts
│   │   │   │   └── entities/
│   │   │   │       └── kyc-submission.entity.ts
│   │   │   └── main.ts
│   │   ├── .env
│   │   └── package.json
│   │
│   └── mobile/                     # App React Native
│       ├── src/
│       │   ├── screens/
│       │   │   └── KycSubmissionScreen.tsx
│       │   ├── services/
│       │   │   └── api.service.ts
│       │   └── components/
│       │       ├── CameraCapture.tsx
│       │       └── DocumentPicker.tsx
│       └── package.json
│
├── packages/
│   ├── agent/                      # Agente LangChain (núcleo de IA)
│   │   ├── src/
│   │   │   ├── agent.ts            # Definição e orquestração do agente
│   │   │   ├── tools/
│   │   │   │   ├── ocr.tool.ts           # Ferramenta de OCR no BI
│   │   │   │   ├── face-compare.tool.ts  # Ferramenta de comparação facial
│   │   │   │   ├── bi-authenticity.tool.ts # Detecção de BI falso
│   │   │   │   └── nif-scraper.tool.ts   # Ferramenta de scraping no Portal do Contribuinte
│   │   │   └── prompts/
│   │   │       └── kyc-system.prompt.ts
│   │   └── package.json
│   │
│   └── shared/                     # Tipos e utilitários partilhados
│       ├── src/
│       │   ├── types/
│       │   │   └── kyc.types.ts
│       │   └── schemas/
│       │       └── kyc.schema.ts
│       └── package.json
│
├── docker-compose.yml              # PostgreSQL + MinIO
├── package.json                    # Root (workspaces)
└── AGENTS.md                       # Este ficheiro
```

---

## 3. Stack Tecnológica

| Camada | Tecnologia | Versão recomendada | Função |
|---|---|---|---|
| Backend | NestJS | ^10.x | API REST, módulos, DI |
| Mobile | React Native | ^0.74.x | Interface de captura e envio |
| Base de dados | PostgreSQL | ^16.x | Persistência de dados |
| Armazenamento | MinIO | latest | Bucket S3-compatível para imagens |
| Agente IA | LangChain (JS) | ^0.2.x | Orquestração de ferramentas e raciocínio |
| Web Scraping | Firecrawl | latest | Scraping do Portal do Contribuinte |
| ORM | TypeORM | ^0.3.x | Mapeamento de entidades |
| Validação | Zod | ^3.x | Schemas partilhados |
| Containerização | Docker + Compose | - | Ambiente de desenvolvimento local |

---

## 4. Fluxo Completo do Agente

O agente recebe uma submissão de KYC e executa os seguintes passos em sequência, com lógica de falha antecipada (fail-fast):

```
[App Mobile]
    │
    │  POST /kyc/submit  (multipart/form-data)
    │  ├── bi_frente (imagem)
    │  ├── bi_verso (imagem)
    │  ├── selfie (imagem)
    │  ├── nome (string)
    │  ├── data_nascimento (string)
    │  ├── numero_bi (string)
    │  └── nif (string)
    ▼
[NestJS — KycService]
    │
    ├── 1. Upload das imagens para o MinIO
    ├── 2. Persistência inicial no PostgreSQL (status: PENDING)
    └── 3. Invocação do Agente LangChain
            │
            ├── STEP 1: OCR no BI (frente + verso)
            │      Extrai: nome, data de nascimento, número do BI,
            │              data de validade, naturalidade, filiação
            │
            ├── STEP 2: Validação dos dados inseridos vs OCR
            │      Compara os dados submetidos pelo utilizador
            │      com os extraídos do BI.
            │      ❌ Divergência → retorna erro KYC_DATA_MISMATCH
            │
            ├── STEP 3: Detecção de autenticidade do BI
            │      Analisa elementos de segurança do BI angolano:
            │      fonte tipográfica, brasão, hologramas, layout,
            │      data de validade coerente, número de BI no formato correcto.
            │      ❌ BI falso detectado → retorna erro KYC_FAKE_DOCUMENT
            │
            ├── STEP 4: Comparação facial (selfie vs foto do BI)
            │      Compara a selfie tirada no momento do upload
            │      com a fotografia extraída da frente do BI.
            │      ❌ Faces diferentes → retorna erro KYC_FACE_MISMATCH
            │
            └── STEP 5: Scraping do Portal do Contribuinte (Firecrawl)
                   Envia o NIF, extrai os dados do contribuinte e
                   valida se batem com o BI e com os dados submetidos.
                   ❌ Dados NIF divergentes → retorna erro KYC_NIF_MISMATCH
                   ✅ Tudo válido → retorna KYC_APPROVED
```

---

## 5. Definição do Agente (`packages/agent`)

### 5.1 Modelo de Linguagem

O agente utiliza um LLM multimodal (com suporte a visão) para processar as imagens. Recomenda-se:

- **Primário:** `claude-3-5-sonnet` (Anthropic) — elevada precisão em visão e OCR
- **Alternativo:** `gpt-4o` (OpenAI)

O modelo deve ter capacidade de **visão** (vision), pois receberá imagens em base64 como parte do input de cada ferramenta.

### 5.2 Tipo de Agente

Agente do tipo **Tool-Calling Agent** (ReAct com chamada de ferramentas), executado de forma sequencial e determinística. Não usa memória persistente — cada invocação é stateless.

### 5.3 Ferramentas do Agente

#### `ocr_bi` — Extracção de dados do BI

**Descrição:** Recebe as imagens (frente e verso) do Bilhete de Identidade angolano em base64 e extrai os campos de texto presentes no documento usando visão multimodal.

**Input:**
```typescript
{
  bi_frente_base64: string;  // Imagem frente do BI em base64
  bi_verso_base64: string;   // Imagem verso do BI em base64
}
```

**Output esperado (JSON):**
```typescript
{
  nome_completo: string;
  data_nascimento: string;     // formato: DD/MM/AAAA
  numero_bi: string;           // formato: XXXXXXXXXA (9 dígitos + letra)
  data_validade: string;
  naturalidade: string;
  nome_pai: string;
  nome_mae: string;
  sexo: "M" | "F";
}
```

**Prompt interno da ferramenta:**
```
Analisa as imagens do Bilhete de Identidade angolano fornecidas (frente e verso).
Extrai todos os campos visíveis com precisão máxima. Retorna APENAS um JSON válido
com os campos especificados. Se um campo não for legível, retorna null para esse campo.
Nunca inventes informação que não esteja explicitamente visível no documento.
```

---

#### `validate_bi_authenticity` — Verificação de autenticidade do BI

**Descrição:** Analisa elementos visuais e estruturais do BI angolano para determinar se é um documento legítimo ou uma falsificação.

**Input:**
```typescript
{
  bi_frente_base64: string;
  bi_verso_base64: string;
  ocr_result: BiOcrData;  // resultado da ferramenta ocr_bi
}
```

**Output esperado:**
```typescript
{
  is_authentic: boolean;
  confidence_score: number;   // 0.0 a 1.0
  issues_detected: string[];  // lista de anomalias encontradas, se houver
}
```

**Elementos verificados pelo modelo:**
- Brasão da República de Angola presente e bem formado
- Tipografia consistente com o padrão do BI angolano (GEMAL/INCM)
- Número do BI no formato correcto: 9 dígitos seguidos de 1-2 letras maiúsculas (ex: `123456789LA0`)
- Data de validade coerente (emissão + 10 anos)
- Faixa de dados da zona legível por máquina (MRZ) no verso, se visível
- Ausência de artefactos de edição digital (bordas irregulares, fontes inconsistentes, pixelização selectiva)
- Foto do titular integrada de forma coerente no documento

**Prompt interno da ferramenta:**
```
Analisa este Bilhete de Identidade angolano e determina se é autêntico ou falsificado.
O BI angolano legítimo possui: brasão nacional, tipografia uniforme, número no formato
XXXXXXXXXA, zona MRZ no verso, e foto integrada com elementos de segurança.
Identifica quaisquer inconsistências visuais, tipográficas ou estruturais.
Retorna um JSON com is_authentic (boolean), confidence_score (0-1) e issues_detected (array).
```

---

#### `compare_faces` — Comparação facial selfie vs BI

**Descrição:** Compara a selfie capturada no momento do upload com a fotografia extraída da frente do BI, para confirmar que pertencem à mesma pessoa.

**Input:**
```typescript
{
  selfie_base64: string;      // Foto tirada no momento
  bi_frente_base64: string;   // Frente do BI com a foto do titular
}
```

**Output esperado:**
```typescript
{
  faces_match: boolean;
  similarity_score: number;   // 0.0 a 1.0
  reason: string;             // Explicação breve da decisão
}
```

**Limiar de decisão:** `similarity_score >= 0.82` → `faces_match = true`

**Prompt interno da ferramenta:**
```
Compara a selfie fornecida com a fotografia presente no Bilhete de Identidade.
Avalia características faciais: estrutura óssea, distância interpupilar, formato
do nariz, queixo e orelhas. Ignora variações de iluminação, ângulo ligeiro e envelhecimento
moderado. Retorna JSON com faces_match (boolean), similarity_score (0.0-1.0) e reason (string).
Sê conservador: em caso de dúvida, retorna faces_match: false.
```

---

#### `scrape_portal_contribuinte` — Verificação do NIF no Portal do Contribuinte

**Descrição:** Utiliza o Firecrawl para aceder ao Portal do Contribuinte Angolano, pesquisar pelo NIF fornecido e extrair os dados do contribuinte para validação cruzada.

**Input:**
```typescript
{
  nif: string;
  nome_esperado: string;     // Nome extraído do BI pelo OCR
}
```

**Output esperado:**
```typescript
{
  nif_found: boolean;
  portal_data: {
    nome: string | null;
    nif: string | null;
    situacao_fiscal: string | null;
  } | null;
  nome_matches: boolean;
  raw_response: string;
}
```

**Comportamento:**
1. O Firecrawl acede à URL do portal de consulta pública do contribuinte angolano.
2. Submete o NIF no formulário de pesquisa.
3. Extrai os dados devolvidos pelo portal (nome, situação fiscal).
4. Compara o nome devolvido com o `nome_esperado` (normalização: maiúsculas, sem acentos, remoção de artigos).
5. Se o NIF não for encontrado no portal, devolve `nif_found: false`.

**Nota de implementação:** A URL exacta do portal e o seletor CSS do formulário de pesquisa devem ser configurados em variáveis de ambiente (`PORTAL_CONTRIBUINTE_URL`), pois podem mudar. Implementar com retry automático (máx. 3 tentativas) e timeout de 15 segundos.

---

### 5.4 Prompt do Sistema do Agente

```typescript
// packages/agent/src/prompts/kyc-system.prompt.ts

export const KYC_SYSTEM_PROMPT = `
És um agente especializado em validação de identidade (KYC) para cidadãos angolanos.
A tua tarefa é verificar se os dados submetidos por um utilizador correspondem ao seu
Bilhete de Identidade (BI) angolano e ao registo no Portal do Contribuinte.

REGRAS OBRIGATÓRIAS:
1. Executa sempre as ferramentas na seguinte ordem:
   ocr_bi → validate_bi_authenticity → compare_faces → scrape_portal_contribuinte
2. Se qualquer etapa falhar, para imediatamente e reporta o erro específico.
   Não continues para a próxima etapa.
3. Nunca inventes ou interpoles dados. Reporta apenas o que foi explicitamente encontrado.
4. Sê conservador: em caso de dúvida sobre autenticidade ou correspondência facial,
   reporta como falha.
5. Retorna sempre a tua resposta final em JSON estruturado conforme o schema KycAgentResult.

CONTEXTO DO BI ANGOLANO:
- Emitido pelo MININT (Ministério do Interior de Angola)
- Número no formato: 9 dígitos + 1-2 letras (ex: 123456789LA0)
- Validade: 10 anos a partir da data de emissão
- Contém foto integrada, brasão nacional, e zona MRZ no verso
`;
```

---

### 5.5 Schema de Resultado do Agente

```typescript
// packages/shared/src/types/kyc.types.ts

export type KycStatus =
  | "KYC_APPROVED"
  | "KYC_DATA_MISMATCH"
  | "KYC_FAKE_DOCUMENT"
  | "KYC_FACE_MISMATCH"
  | "KYC_NIF_MISMATCH"
  | "KYC_PROCESSING_ERROR";

export interface BiOcrData {
  nome_completo: string | null;
  data_nascimento: string | null;
  numero_bi: string | null;
  data_validade: string | null;
  naturalidade: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  sexo: "M" | "F" | null;
}

export interface KycAgentResult {
  status: KycStatus;
  message: string;
  details: {
    ocr_data?: BiOcrData;
    authenticity?: {
      is_authentic: boolean;
      confidence_score: number;
      issues_detected: string[];
    };
    face_comparison?: {
      faces_match: boolean;
      similarity_score: number;
    };
    nif_verification?: {
      nif_found: boolean;
      nome_matches: boolean;
      portal_data: Record<string, string | null> | null;
    };
  };
}
```

---

## 6. API REST (NestJS)

### 6.1 Endpoint Principal

```
POST /kyc/submit
Content-Type: multipart/form-data
```

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `bi_frente` | File (image/*) | ✅ | Foto da frente do BI |
| `bi_verso` | File (image/*) | ✅ | Foto do verso do BI |
| `selfie` | File (image/*) | ✅ | Selfie tirada no momento |
| `nome` | string | ✅ | Nome completo do utilizador |
| `data_nascimento` | string | ✅ | Data de nascimento (DD/MM/AAAA) |
| `numero_bi` | string | ✅ | Número do BI |
| `nif` | string | ✅ | Número de Identificação Fiscal |

**Resposta de sucesso (200):**
```json
{
  "submission_id": "uuid-v4",
  "status": "KYC_APPROVED",
  "message": "Identidade validada com sucesso.",
  "details": { "..." : "..." }
}
```

**Respostas de erro:**

| HTTP Status | Código interno | Causa |
|---|---|---|
| 422 | `KYC_DATA_MISMATCH` | Dados inseridos não coincidem com o BI |
| 422 | `KYC_FAKE_DOCUMENT` | BI detectado como falso |
| 422 | `KYC_FACE_MISMATCH` | Selfie não corresponde à foto do BI |
| 422 | `KYC_NIF_MISMATCH` | NIF não bate com os dados do BI no portal |
| 500 | `KYC_PROCESSING_ERROR` | Erro interno durante o processamento |

### 6.2 Endpoint de Consulta de Submissão

```
GET /kyc/submission/:id
```

Devolve o estado e resultado de uma submissão anterior, consultando a base de dados.

---

## 7. Modelo de Dados (PostgreSQL)

### Entidade `kyc_submissions`

```sql
CREATE TABLE kyc_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  numero_bi       VARCHAR(20) NOT NULL,
  nif             VARCHAR(20) NOT NULL,

  -- Referências às imagens no MinIO
  bi_frente_key   VARCHAR(500) NOT NULL,
  bi_verso_key    VARCHAR(500) NOT NULL,
  selfie_key      VARCHAR(500) NOT NULL,

  -- Resultado do agente
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  agent_result    JSONB,

  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Estados possíveis de `status`:**
`PENDING` → `PROCESSING` → `KYC_APPROVED` | `KYC_DATA_MISMATCH` | `KYC_FAKE_DOCUMENT` | `KYC_FACE_MISMATCH` | `KYC_NIF_MISMATCH` | `KYC_PROCESSING_ERROR`

---

## 8. Armazenamento de Imagens (MinIO)

### Organização dos Buckets

```
bucket: kyc-documents/
└── {submission_id}/
    ├── bi_frente.jpg
    ├── bi_verso.jpg
    └── selfie.jpg
```

### Configuração

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=kyc-documents
MINIO_USE_SSL=false
```

As imagens são armazenadas no MinIO antes de serem passadas ao agente. O agente recebe as imagens convertidas para base64 directamente pelo `StorageService`.

---

## 9. Variáveis de Ambiente

### `apps/api/.env`

```env
# Servidor
PORT=3000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kyc_db

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=kyc-documents
MINIO_USE_SSL=false

# LLM (escolher um)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...   # alternativa

# Firecrawl
FIRECRAWL_API_KEY=fc-...
PORTAL_CONTRIBUINTE_URL=https://portaldocontribuinte.minfin.gov.ao/consulta

# Agente
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
FACE_SIMILARITY_THRESHOLD=0.82
```

---

## 10. Docker Compose (Ambiente Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kyc_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"   # API S3
      - "9001:9001"   # Console web
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

---

## 11. App Mobile (React Native)

### Fluxo do Utilizador

```
1. Ecrã de boas-vindas
        │
        ▼
2. Formulário de dados pessoais
   (nome, data de nascimento, número do BI, NIF)
        │
        ▼
3. Captura do BI — Frente
   (câmara ou galeria)
        │
        ▼
4. Captura do BI — Verso
   (câmara ou galeria)
        │
        ▼
5. Captura da Selfie
   (câmara frontal — obrigatório em tempo real, galeria não permitida)
        │
        ▼
6. Ecrã de revisão e confirmação
        │
        ▼
7. Envio → POST /kyc/submit
        │
        ▼
8. Ecrã de resultado
   (Aprovado ✅ / Erro ❌ com motivo específico)
```

### Considerações de Implementação

- A selfie **deve** ser capturada pela câmara frontal no momento — não permitir upload da galeria para este campo.
- Comprimir as imagens antes do envio (máx. 1MB por imagem, JPEG 85%) para reduzir o tempo de upload.
- Mostrar um ecrã de loading com indicação de progresso durante o processamento (pode demorar 20-40 segundos).
- Tratar os códigos de erro específicos da API e mostrar mensagens claras em Português ao utilizador.

---

## 12. Decisões de Design e Limitações do MVP

| Decisão | Justificação |
|---|---|
| Sem autenticação | MVP focado nas funcionalidades core; auth pode ser adicionada em iteração seguinte |
| Processamento síncrono | Simplicidade do MVP; considerar filas (BullMQ) numa versão futura |
| Imagens em base64 para o LLM | Evita complexidade de URLs pré-assinadas no fluxo do agente |
| Fail-fast no agente | Evita custos desnecessários de LLM se uma validação inicial falhar |
| LLM multimodal para OCR e visão | Centraliza OCR, face-match e autenticidade numa única dependência |
| Firecrawl para scraping | Abstrai a complexidade de Puppeteer/Playwright; gere anti-bot automaticamente |

### Limitações Conhecidas

- A precisão do OCR depende da qualidade das imagens; fotos desfocadas ou com baixa iluminação podem causar falhas.
- O scraping do Portal do Contribuinte está sujeito a mudanças no HTML do portal, exigindo manutenção dos selectores.
- A detecção de BI falso via LLM tem limitações — falsificações de alta qualidade podem não ser detectadas; recomenda-se revisão humana em casos de baixa confiança numa versão futura.
- O threshold de similaridade facial (0.82) é um valor inicial que deve ser calibrado com dados reais.

---

## 13. Roadmap Pós-MVP

- [ ] Autenticação JWT / OAuth2
- [ ] Processamento assíncrono com filas (BullMQ + Redis)
- [ ] Dashboard de administração para revisão manual de casos
- [ ] Webhooks para notificação de resultado
- [ ] Cache de resultados de NIF (Redis, TTL 24h)
- [ ] Auditoria e logs estruturados (Winston + formato JSON)
- [ ] Testes de integração dos agentes com casos reais
- [ ] Rate limiting por IP e por número de BI

---

*Este documento é a fonte de verdade para o comportamento esperado do agente e da API. Qualquer alteração ao fluxo, às ferramentas ou aos schemas deve ser reflectida aqui antes da implementação.*
