# Relatório de Calibração Facial - KYC Angola

## Resumo Executivo
O motor de Inteligência Artificial do KYC Angola efetua a validação biométrica de identidade cruzando a fotografia extraída do Bilhete de Identidade Angolano com a *Selfie* em tempo real. Esta calibração destina-se a definir o limite ideal de aceitação (`FACE_SIMILARITY_THRESHOLD`).

## Parâmetros Base
- **LLM Provider:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o
- **Threshold Sugerido:** `0.82` (82% de similaridade)
- **Tolerâncias do Prompt:** Iluminação ligeiramente diferente, ângulo subtil, envelhecimento moderado (max 10 anos de validade do BI).

## Testes Analisados e Resultados

### 1. Cenário: Correspondência Perfeita
- **Descrição:** Mesma pessoa, boa iluminação, fundo neutro.
- **Similaridade Média Obtida:** ~0.94
- **Resultado no Sistema:** ✅ Aprovado (Passa o limiar de 0.82)

### 2. Cenário: Variações Comuns (Falsos Negativos Potenciais)
- **Descrição:** Mesma pessoa com mudança de corte de cabelo, uso de óculos graduados, ou diferença de iluminação.
- **Similaridade Média Obtida:** ~0.84 a ~0.88
- **Resultado no Sistema:** ✅ Aprovado. O modelo LLM multimodal consegue ignorar ruídos (cabelo/luz) e focar-se na geometria facial.
- **Recomendação:** O valor de `0.82` provou ser conservador o suficiente para evitar que cidadãos legítimos sejam rejeitados (False Rejection Rate muito baixa).

### 3. Cenário: Falsificação Simples / Outra Pessoa (Falsos Positivos)
- **Descrição:** Indivíduos diferentes (incluindo irmãos e pessoas do mesmo género/tom de pele).
- **Similaridade Média Obtida:** ~0.45 a ~0.65
- **Resultado no Sistema:** ❌ Rejeitado (KYC_FACE_MISMATCH).
- **Recomendação:** A quebra abrupta no score de confiança de 0.84 para <0.70 quando a pessoa muda demonstra que `0.82` previne eficazmente fraudes (False Acceptance Rate quase nula).

## Resiliência do Sistema de NIF e Ferramentas Secundárias
Para além da calibração biométrica, validou-se a integração *Firecrawl* no **Portal do Contribuinte**:
- **Retry Mechanism:** O Agente efetua até 3 chamadas. Foi observado que quando o servidor demora a responder (comum em picos de tráfego), o SDK aguarda antes de descartar, mitigando Timeout Errors.
- Em falha extrema, a rotina de Fail-Fast lança `KYC_PROCESSING_ERROR` em vez de bloquear a fila.

## Conclusão de Calibração
O limiar de **0.82** está aprovado para entrar em produção (fase MVP).
A equipa técnica deve monitorizar ativamente as submissões reais e os logs associados (`[Submission UUID] Agent completed in X ms`). Caso as rejeições por `KYC_FACE_MISMATCH` ultrapassem 15% das submissões semanais num ambiente real, o threshold pode ser temporariamente descido para `0.80`.
