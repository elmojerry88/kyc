CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE kyc_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
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
