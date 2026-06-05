import { z } from "zod";
import { getLLM } from "../model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const FaceComparisonResponseSchema = z.object({
  faces_match: z.boolean().describe("Verdadeiro se as duas faces pertencerem à mesma pessoa"),
  similarity_score: z.number().min(0).max(1).describe("Pontuação de similaridade entre 0.0 e 1.0"),
  reason: z.string().describe("Breve explicação da decisão baseada nas características morfológicas"),
});

export async function compareFaces(selfieBase64: string, biFrenteBase64: string) {
  const llm = (getLLM() as any).withStructuredOutput(FaceComparisonResponseSchema, { name: "compare_faces" });

  const threshold = parseFloat(process.env.FACE_SIMILARITY_THRESHOLD || "0.82");

  const systemPrompt = `
Compara a selfie fornecida com a fotografia presente no Bilhete de Identidade.
Avalia características faciais: estrutura óssea, distância interpupilar, formato
do nariz, queixo e orelhas. Ignora variações de iluminação, ângulo ligeiro e envelhecimento
moderado. Retorna JSON com faces_match (boolean), similarity_score (0.0-1.0) e reason (string).
Sê conservador: em caso de dúvida, retorna faces_match: false.
Nota: Se similarity_score >= ${threshold}, deves retornar faces_match: true (a menos que haja anomalia grave).
  `;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage({
      content: [
        { type: "text", text: "Aqui está a fotografia do Bilhete de Identidade:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${biFrenteBase64}` } },
        { type: "text", text: "Aqui está a Selfie capturada no momento:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${selfieBase64}` } }
      ]
    })
  ];

  const result = await llm.invoke(messages);
  
  // Enforce threshold logic strictly inside the tool just to be safe
  if (result.similarity_score >= threshold) {
    result.faces_match = true;
  } else {
    result.faces_match = false;
  }
  
  return result;
}
