export type KycStatus = "PENDING" | "PROCESSING" | "KYC_APPROVED" | "KYC_DATA_MISMATCH" | "KYC_FAKE_DOCUMENT" | "KYC_FACE_MISMATCH" | "KYC_NIF_MISMATCH" | "KYC_PROCESSING_ERROR";
export interface BiOcrData {
    nome_completo: string | null;
    data_nascimento: string | null;
    numero_bi: string | null;
    data_validade: string | null;
    naturalidade: string | null;
    nome_pai: string | null;
    nome_mae: string | null;
    sexo: "M" | "F" | null;
}
export interface KycAgentResult {
    status: KycStatus;
    message: string;
    details: {
        ocr_data?: BiOcrData;
        authenticity?: {
            is_authentic: boolean;
            confidence_score: number;
            issues_detected: string[];
        };
        face_comparison?: {
            faces_match: boolean;
            similarity_score: number;
        };
        nif_verification?: {
            nif_found: boolean;
            nome_matches: boolean;
            portal_data: Record<string, string | null> | null;
        };
    };
}
