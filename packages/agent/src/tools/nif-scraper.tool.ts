import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

export interface NifScrapeResult {
  nif_found: boolean;
  portal_data: {
    nome: string | null;
    nif: string | null;
    situacao_fiscal: string | null;
  } | null;
  nome_matches: boolean;
  raw_response?: any;
}

export function normalizeName(name: string): string {
  if (!name) return "";
  const withoutAccents = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const upper = withoutAccents.toUpperCase();
  const tokens = upper.split(/\s+/);
  const stopWords = ["DE", "DA", "DO", "DAS", "DOS", "E"];
  const filtered = tokens.filter((token) => !stopWords.includes(token));
  return filtered.join(" ");
}

export async function scrapePortalContribuinte(nif: string, expectedName: string): Promise<NifScrapeResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  const portalUrl = process.env.PORTAL_CONTRIBUINTE_URL || "https://portaldocontribuinte.minfin.gov.ao/consulta";

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not defined");
  }

  const app = new FirecrawlApp({ apiKey });

  let attempt = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      
      // Firecrawl Extract with Actions (assuming the form has an input with name or id 'nif' and a submit button)
      // Since we don't have the exact HTML, we use a generalized prompt via the extract API.
      // Firecrawl allows LLM-based extraction. 
      const response = await app.scrapeUrl(portalUrl, {
        formats: ["extract"],
        extract: {
          prompt: `Pesquisa pelo NIF "${nif}" e extrai os dados do contribuinte.`,
          schema: z.object({
            nome: z.string().optional().describe("O nome completo do contribuinte"),
            nif: z.string().optional().describe("O número de identificação fiscal (NIF)"),
            situacao_fiscal: z.string().optional().describe("A situação fiscal do contribuinte, ex: Activo, Regularizado, Não Regularizado"),
            encontrado: z.boolean().describe("True se os dados do NIF foram encontrados, false caso contrário")
          })
        },
        timeout: 15000 // 15 seconds strict timeout
      });

      if (!response.success || !response.extract) {
        throw new Error(`Scrape failed: ${response.error}`);
      }

      const extracted = response.extract as any;

      if (!extracted.encontrado) {
        return {
          nif_found: false,
          portal_data: null,
          nome_matches: false,
          raw_response: response,
        };
      }

      const portalData = {
        nome: extracted.nome || null,
        nif: extracted.nif || null,
        situacao_fiscal: extracted.situacao_fiscal || null,
      };

      const normalizedExpected = normalizeName(expectedName);
      const normalizedPortal = normalizeName(portalData.nome || "");
      const nomeMatches = normalizedExpected === normalizedPortal;

      return {
        nif_found: true,
        portal_data: portalData,
        nome_matches: nomeMatches,
        raw_response: response,
      };

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed for NIF scrape:`, error);
      if (attempt >= maxAttempts) {
        break;
      }
    }
  }

  throw new Error(`Failed to scrape portal after ${maxAttempts} attempts. Last error: ${lastError}`);
}
