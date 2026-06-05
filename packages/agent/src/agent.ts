import { KycAgentResult, KycStatus, BiOcrData } from "@kyc/shared";
import { runOcrBi } from "./tools/ocr.tool";
import { validateBiAuthenticity } from "./tools/bi-authenticity.tool";
import { compareFaces } from "./tools/face-compare.tool";
import { scrapePortalContribuinte, normalizeName } from "./tools/nif-scraper.tool";

export interface KycInput {
  submission_data: {
    nome: string;
    data_nascimento: string;
    numero_bi: string;
    nif: string;
  };
  images_base64: {
    bi_frente: string;
    bi_verso: string;
    selfie: string;
  };
}

export async function runKycAgent(input: KycInput): Promise<KycAgentResult> {
  const resultDetails: KycAgentResult["details"] = {};

  try {
    // STEP 1: OCR
    const ocrData = await runOcrBi(input.images_base64.bi_frente, input.images_base64.bi_verso);
    resultDetails.ocr_data = ocrData;

    // STEP 2: Validate OCR data vs User Submission
    if (
      normalizeName(ocrData.nome_completo || "") !== normalizeName(input.submission_data.nome) ||
      ocrData.numero_bi?.toUpperCase() !== input.submission_data.numero_bi.toUpperCase() ||
      ocrData.data_nascimento !== input.submission_data.data_nascimento
    ) {
      return {
        status: "KYC_DATA_MISMATCH",
        message: "Os dados submetidos não coincidem com os dados lidos do documento.",
        details: resultDetails,
      };
    }

    // STEP 3: Validate Authenticity
    const authResult = await validateBiAuthenticity(
      input.images_base64.bi_frente, 
      input.images_base64.bi_verso, 
      ocrData
    );
    resultDetails.authenticity = authResult;

    if (!authResult.is_authentic || authResult.confidence_score < 0.6) {
      return {
        status: "KYC_FAKE_DOCUMENT",
        message: "O documento de identificação falhou na validação de autenticidade estrutural.",
        details: resultDetails,
      };
    }

    // STEP 4: Compare Faces
    const faceResult = await compareFaces(
      input.images_base64.selfie, 
      input.images_base64.bi_frente
    );
    resultDetails.face_comparison = faceResult;

    if (!faceResult.faces_match) {
      return {
        status: "KYC_FACE_MISMATCH",
        message: "A selfie não corresponde à fotografia presente no Bilhete de Identidade.",
        details: resultDetails,
      };
    }

    // STEP 5: Verify NIF via Firecrawl
    const nifResult = await scrapePortalContribuinte(
      input.submission_data.nif, 
      input.submission_data.nome
    );
    resultDetails.nif_verification = {
      nif_found: nifResult.nif_found,
      nome_matches: nifResult.nome_matches,
      portal_data: nifResult.portal_data || null
    };

    if (!nifResult.nif_found || !nifResult.nome_matches) {
      return {
        status: "KYC_NIF_MISMATCH",
        message: "O NIF fornecido não foi encontrado ou os dados não batem com o Portal do Contribuinte.",
        details: resultDetails,
      };
    }

    // ALL CLEAR
    return {
      status: "KYC_APPROVED",
      message: "Identidade validada com sucesso.",
      details: resultDetails,
    };

  } catch (error: any) {
    console.error("Agent process failed critically:", error);
    return {
      status: "KYC_PROCESSING_ERROR",
      message: `Erro interno ao processar validação: ${error.message || "Erro desconhecido"}`,
      details: resultDetails,
    };
  }
}
