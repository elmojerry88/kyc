# Sprint 2: Núcleo do Agente de IA (Visão, OCR e Bio)

**Objectivo**: Criar o pacote principal do agente LangChain e as três ferramentas principais de análise visual e biométrica (OCR, detecção de fraude documental e comparação facial) utilizando visão computacional baseada em modelos multimodais (Claude 3.5 Sonnet ou GPT-4o).

---

## 📋 Lista de Tarefas (ToDo)

### 1. Inicialização do Pacote do Agente (`packages/agent`)
- [ ] Configurar `packages/agent/package.json` com dependências necessárias (`@langchain/core`, `@langchain/anthropic`, `@langchain/openai`, `zod`).
- [ ] Criar a estrutura de directórios: `src/tools/`, `src/prompts/` e `src/tests/`.
- [ ] Criar a fábrica de modelos em `packages/agent/src/model.ts` para instanciar o LLM multimodal correto com base no `LLM_PROVIDER` ("anthropic" ou "openai").

### 2. Ferramenta OCR (`ocr_bi`)
- [ ] Criar o ficheiro `packages/agent/src/tools/ocr.tool.ts`.
- [ ] Definir o schema Zod para os parâmetros de entrada (imagens em base64 da frente e do verso).
- [ ] Escrever o prompt detalhado para o modelo multimodal orientando-o a extrair exactamente os dados estruturados do BI angolano.
- [ ] Implementar a chamada ao LLM passando as imagens anexadas no formato correto (MessageContent/Block para Anthropic/OpenAI).
- [ ] Retornar o JSON tipado conforme a estrutura de dados `BiOcrData`.

### 3. Ferramenta de Autenticidade (`validate_bi_authenticity`)
- [ ] Criar o ficheiro `packages/agent/src/tools/bi-authenticity.tool.ts`.
- [ ] Definir a entrada recebendo frente, verso em base64 e os dados extraídos pelo OCR.
- [ ] Escrever o prompt de verificação estrutural e visual (brasão, tipografia padrão, coerência de validade de 10 anos, estrutura MRZ).
- [ ] Implementar a avaliação lógica do modelo retornando `is_authentic`, `confidence_score` e `issues_detected`.

### 4. Ferramenta de Comparação Facial (`compare_faces`)
- [ ] Criar o ficheiro `packages/agent/src/tools/face-compare.tool.ts`.
- [ ] Configurar a entrada recebendo a `selfie` e a frente do `BI` em base64.
- [ ] Escrever o prompt comparativo de faces com base nos traços morfológicos, ignorando iluminação ou envelhecimento natural.
- [ ] Retornar `faces_match`, `similarity_score` e a justificativa (`reason`).
- [ ] Aplicar a lógica de comparação baseada no limiar de corte `FACE_SIMILARITY_THRESHOLD = 0.82` (se `similarity_score >= 0.82` então `faces_match = true`).

### 5. Script de Teste Isolado das Ferramentas
- [ ] Criar um script temporário em `packages/agent/src/tests/test-tools.ts` que carrega imagens de exemplo locais (frente, verso e selfie) e chama cada ferramenta isoladamente.
- [ ] Executar o script e validar que o OCR e a comparação de faces estão a retornar respostas coerentes estruturadas em JSON.

---

## 🔍 Critérios de Aceitação
- [x] O pacote `@kyc/agent` compila sem erros de importação ou dependência.
- [x] A ferramenta `ocr_bi` consegue ler uma imagem em base64 e extrair os dados corretos em formato JSON.
- [x] A ferramenta `validate_bi_authenticity` detecta anomalias grosseiras em imagens manipuladas de BI (ex: data de validade vencida ou fora do período de 10 anos).
- [x] A ferramenta `compare_faces` atribui scores acima de 0.82 a selfies pertencentes ao mesmo indivíduo do BI e scores inferiores a tentativas de fraude.
