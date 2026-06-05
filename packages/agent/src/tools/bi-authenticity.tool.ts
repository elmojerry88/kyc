import { z } from "zod";
import { getLLM } from "../model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BiOcrData } from "@kyc/shared";

const AuthenticityResponseSchema = z.object({
  is_authentic: z.boolean().describe("Se o Bilhete de Identidade parece ser autêntico"),
  confidence_score: z.number().min(0).max(1).describe("Nível de confiança na avaliação de 0.0 a 1.0"),
  issues_detected: z.array(z.string()).describe("Lista de anomalias encontradas, vazio se estiver tudo certo"),
});

export async function validateBiAuthenticity(
  biFrenteBase64: string,
  biVersoBase64: string,
  ocrResult: BiOcrData
) {
  const llm = (getLLM() as any).withStructuredOutput(AuthenticityResponseSchema, { name: "validate_bi" });

  const systemPrompt = `
Analisa este Bilhete de Identidade angolano e determina se é autêntico ou falsificado.
O BI angolano legítimo possui: brasão nacional, tipografia uniforme, número no formato
XXXXXXXXXA, zona MRZ no verso, e foto integrada com elementos de segurança.
Identifica quaisquer inconsistências visuais, tipográficas ou estruturais.
Retorna um JSON com is_authentic (boolean), confidence_score (0-1) e issues_detected (array).
  `;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage({
      content: [
        { type: "text", text: `Aqui estão os dados previamente extraídos via OCR para referência: ${JSON.stringify(ocrResult, null, 2)}` },
        { type: "text", text: "Aqui está a imagem da FRENTE do Bilhete de Identidade:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${biFrenteBase64}` } },
        { type: "text", text: "Aqui está a imagem do VERSO do Bilhete de Identidade:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${biVersoBase64}` } }
      ]
    })
  ];

  const result = await llm.invoke(messages);
  return result;
}
