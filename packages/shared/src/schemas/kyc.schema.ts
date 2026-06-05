import { z } from "zod";

const biRegex = /^\d{9}[A-Z]{1,2}\d$/;

export const KycSubmissionSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data de nascimento deve estar no formato DD/MM/AAAA"),
  numero_bi: z.string().regex(biRegex, "Número do BI inválido. O formato deve ser 9 dígitos seguidos de 1 ou 2 letras e 1 dígito (ex: 123456789LA0)"),
  nif: z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
});

export type KycSubmission = z.infer<typeof KycSubmissionSchema>;
