import { z } from "zod";
export declare const KycSubmissionSchema: z.ZodObject<{
    nome: z.ZodString;
    data_nascimento: z.ZodString;
    numero_bi: z.ZodString;
    nif: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nome: string;
    data_nascimento: string;
    numero_bi: string;
    nif: string;
}, {
    nome: string;
    data_nascimento: string;
    numero_bi: string;
    nif: string;
}>;
export type KycSubmission = z.infer<typeof KycSubmissionSchema>;
