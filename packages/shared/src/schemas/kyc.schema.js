"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycSubmissionSchema = void 0;
const zod_1 = require("zod");
const biRegex = /^\d{9}[A-Z]{1,2}\d$/;
exports.KycSubmissionSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    data_nascimento: zod_1.z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data de nascimento deve estar no formato DD/MM/AAAA"),
    numero_bi: zod_1.z.string().regex(biRegex, "Número do BI inválido. O formato deve ser 9 dígitos seguidos de 1 ou 2 letras e 1 dígito (ex: 123456789LA0)"),
    nif: zod_1.z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
});
//# sourceMappingURL=kyc.schema.js.map