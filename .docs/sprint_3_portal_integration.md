# Sprint 3: Integração Portal do Contribuinte & Orquestração do Agente

**Objectivo**: Implementar o scraping do Portal do Contribuinte angolano utilizando o Firecrawl para validar os dados cadastrais do NIF fornecido, e em seguida estruturar a orquestração sequencial determinística do agente de IA com lógica fail-fast.

---

## 📋 Lista de Tarefas (ToDo)

### 1. Ferramenta de Consulta de NIF (`scrape_portal_contribuinte`)
- [ ] Criar o ficheiro `packages/agent/src/tools/nif-scraper.tool.ts`.
- [ ] Configurar o cliente HTTP ou API SDK do Firecrawl utilizando a variável de ambiente `FIRECRAWL_API_KEY`.
- [ ] Implementar a navegação e scraping do portal usando `PORTAL_CONTRIBUINTE_URL`.
- [ ] Adicionar lógica de submissão do formulário de pesquisa usando o NIF fornecido.
- [ ] Tratar a extracção dos campos devolvidos pelo portal:
  - [ ] Nome completo do contribuinte.
  - [ ] Número do NIF retornado.
  - [ ] Situação Fiscal (Ex: "Activo", "Regularizado", "Não Regularizado").
- [ ] Implementar algoritmo de normalização para comparação de nomes (remover acentuação, transformar para maiúsculas, ignorar preposições/conjunções como "de", "da", "do", "e").
- [ ] Adicionar tratamento de erros:
  - [ ] Retentativas automáticas em caso de falha de rede/portal (máximo 3 tentativas).
  - [ ] Timeout estrito de 15 segundos para evitar bloqueio infinito.
- [ ] Retornar o JSON estructurado com `nif_found`, `portal_data` e `nome_matches`.

### 2. Orquestração Sequencial do Agente (`agent.ts`)
- [ ] Criar o ficheiro `packages/agent/src/prompts/kyc-system.prompt.ts` contendo a directiva `KYC_SYSTEM_PROMPT`.
- [ ] Criar o orquestrador principal em `packages/agent/src/agent.ts`.
- [ ] Desenhar o motor de execução determinístico que consome as ferramentas na ordem estipulada:
  1. Executar `ocr_bi` -> Se falhar ou dados críticos estiverem em falta, reportar erro.
  2. Comparar dados inseridos pelo utilizador com OCR -> Se houver discrepância de nome/data de nascimento/número de BI, retornar status `KYC_DATA_MISMATCH`.
  3. Executar `validate_bi_authenticity` -> Se `is_authentic = false` ou confiança muito baixa, retornar status `KYC_FAKE_DOCUMENT`.
  4. Executar `compare_faces` -> Se `faces_match = false`, retornar status `KYC_FACE_MISMATCH`.
  5. Executar `scrape_portal_contribuinte` -> Se `nif_found = false` ou `nome_matches = false`, retornar status `KYC_NIF_MISMATCH`.
  6. Se todas as etapas forem bem-sucedidas, retornar status `KYC_APPROVED`.
- [ ] Tratar qualquer excepção não prevista durante o fluxo e retornar status `KYC_PROCESSING_ERROR`.
- [ ] Exportar a função principal de orquestração `runKycAgent` no ficheiro entrypoint do pacote (`packages/agent/src/index.ts`).

---

## 🔍 Critérios de Aceitação
- [x] O scraper consegue submeter um NIF e extrair com sucesso o nome e a situação fiscal da página de resultado.
- [x] O algoritmo de comparação de nomes ignora caracteres especiais e espaços adicionais (ex: "ANTÓNIO DA SILVA" bate com "antonio silva").
- [x] O agente aborta o processamento assim que uma das etapas falha (fail-fast), não chamando as ferramentas subsequentes.
- [x] O resultado final da orquestração é sempre mapeado para um dos tipos de `KycStatus` e segue o schema `KycAgentResult`.
