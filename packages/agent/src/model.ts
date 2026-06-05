import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export function getLLM() {
  const provider = process.env.LLM_PROVIDER || "anthropic";
  const modelName = process.env.LLM_MODEL || "claude-3-5-sonnet-20241022";

  if (provider === "anthropic") {
    return new ChatAnthropic({
      modelName,
      temperature: 0,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  if (provider === "openai") {
    return new ChatOpenAI({
      modelName: modelName.includes("gpt") ? modelName : "gpt-4o",
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
}
