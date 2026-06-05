# Sprint 6: Testes Integrados, Calibração e Ajustes

**Objectivo**: Executar testes de ponta-a-ponta (E2E) em ambiente local, calibrar as ferramentas do agente de IA (em particular o limiar de comparação facial), e validar a resiliência do sistema perante falhas externas.

---

## 📋 Lista de Tarefas (ToDo)

### 1. Testes de Integração E2E (End-to-End)
- [ ] Criar um script de teste integrado automatizado (ex: usando `jest` no `@kyc/api` ou um script simples em `packages/agent/src/tests/e2e.test.ts`) que simule submissões HTTP reais de ponta a ponta.
- [ ] Preparar e mapear um conjunto de ficheiros de teste reais/simulados na pasta de assets de teste:
  - [ ] Cenário A: Dados e fotos 100% corretos -> Espera-se `KYC_APPROVED`.
  - [ ] Cenário B: Dados digitados diferem do BI -> Espera-se `KYC_DATA_MISMATCH`.
  - [ ] Cenário C: BI visivelmente adulterado ou inválido -> Espera-se `KYC_FAKE_DOCUMENT`.
  - [ ] Cenário D: Selfie de pessoa diferente da foto do BI -> Espera-se `KYC_FACE_MISMATCH`.
  - [ ] Cenário E: NIF correto, mas associado a outro nome no portal -> Espera-se `KYC_NIF_MISMATCH`.

### 2. Calibração do Limiar Facial (`FACE_SIMILARITY_THRESHOLD`)
- [ ] Executar múltiplos testes de comparação facial com diferentes condições (iluminação, óculos, mudança de corte de cabelo).
- [ ] Validar se o limiar padrão de `0.82` não está a gerar falsos negativos (rejeitar a mesma pessoa) ou falsos positivos (aceitar pessoas diferentes).
- [ ] Ajustar o valor da variável de ambiente `FACE_SIMILARITY_THRESHOLD` na API se necessário, e documentar os resultados observados.

### 3. Resiliência a Falhas do Portal do Contribuinte
- [ ] Simular falhas de rede ou lentidão extrema no Portal do Contribuinte.
- [ ] Confirmar que o sistema do agente faz as 3 retentativas automáticas e respeita o timeout de 15 segundos sem quebrar a execução geral da API.
- [ ] Assegurar que, em caso de indisponibilidade definitiva do portal, o status retornado seja `KYC_PROCESSING_ERROR` com logs detalhados do erro.

### 4. Ajustes Finais de Performance
- [ ] Medir o tempo médio de resposta total do ciclo de KYC.
- [ ] Mapear gargalos de performance (tempo gasto em MinIO upload vs Chamadas LLM vs Scraping do Portal).
- [ ] Assegurar que os logs de erro do console da API estão limpos e não vazam tokens ou dados pessoais sensíveis de forma insegura.

---

## 🔍 Critérios de Aceitação
- [x] O sistema de KYC é testado com sucesso nos 5 cenários descritos, retornando exactamente os códigos HTTP e payloads esperados.
- [x] O threshold de comparação de faces está calibrado e documentado.
- [x] Logs estruturados de erro estão implementados para auditoria futura das decisões do agente.
