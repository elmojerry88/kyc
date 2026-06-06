import { z } from "zod";

const biRegex = /^\d{9}[A-Z]{9}\d$/;

export const KycSubmissionSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data de nascimento deve estar no formato DD/MM/AAAA"),
  nif: z.string(),
});

export type KycSubmission = z.infer<typeof KycSubmissionSchema>;
