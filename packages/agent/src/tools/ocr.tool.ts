import { z } from "zod";
import { getLLM } from "../model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BiOcrData } from "@kyc/shared";

const OcrResponseSchema = z.object({
  nome_completo: z.string().nullable().describe("Nome completo do indivíduo"),
  data_nascimento: z.string().nullable().describe("Data de nascimento no formato DD/MM/AAAA"),
  numero_bi: z.string().nullable().describe("Número do BI no formato XXXXXXXXXA"),
  data_validade: z.string().nullable().describe("Data de validade do documento no formato DD/MM/AAAA"),
  naturalidade: z.string().nullable().describe("Naturalidade (província/cidade)"),
  nome_pai: z.string().nullable().describe("Filiação - nome do pai"),
  nome_mae: z.string().nullable().describe("Filiação - nome da mãe"),
  sexo: z.enum(["M", "F"]).nullable().describe("Sexo, M ou F"),
});

export async function runOcrBi(biFrenteBase64: string, biVersoBase64: string): Promise<BiOcrData> {
  const llm = (getLLM() as any).withStructuredOutput(OcrResponseSchema, { name: "extract_bi_data" });

  const systemPrompt = `
Analisa as imagens do Bilhete de Identidade angolano fornecidas (frente e verso).
Extrai todos os campos visíveis com precisão máxima. Retorna APENAS um JSON válido
com os campos especificados. Se um campo não for legível, retorna null para esse campo.
Nunca inventes informação que não esteja explicitamente visível no documento.
`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage({
      content: [
        { type: "text", text: "Aqui está a imagem da FRENTE do Bilhete de Identidade:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${biFrenteBase64}` } },
        { type: "text", text: "Aqui está a imagem do VERSO do Bilhete de Identidade:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${biVersoBase64}` } }
      ]
    })
  ];

  const result = await llm.invoke(messages);
  return result as BiOcrData;
}
