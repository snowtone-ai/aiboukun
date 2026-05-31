import { GeminiProvider } from "./gemini-provider";
import type { LLMProvider } from "./provider";

export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? "gemini";

  if (provider === "gemini") {
    return new GeminiProvider(process.env.GEMINI_API_KEY ?? "");
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}
