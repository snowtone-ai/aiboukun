import type { LLMJsonResult, LLMRequest, LLMTextResult, TokenUsage } from "./provider";

const JPY_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": { input: 0.05, output: 0.2 },
};

export type LogLLMUsageInput = {
  organizationId?: string | null;
  provider: string;
  model: string;
  purpose: string;
  usage?: TokenUsage;
};

export async function logLLMUsage(input: LogLLMUsageInput) {
  const { prisma } = await import("@/lib/prisma/client");
  const usage = input.usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  return prisma.lLMUsageLog.create({
    data: {
      organizationId: input.organizationId ?? null,
      provider: input.provider,
      model: input.model,
      purpose: input.purpose,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      estimatedCostJpy: estimateCostJpy(input.model, usage),
    },
  });
}

export async function logLLMResult(
  request: LLMRequest,
  result: LLMTextResult | LLMJsonResult<unknown>,
  organizationId?: string | null,
) {
  return logLLMUsage({
    organizationId,
    provider: result.provider,
    model: result.model,
    purpose: request.purpose,
    usage: result.usage,
  });
}

export function estimateCostJpy(model: string, usage: TokenUsage) {
  const price = JPY_PER_1K_TOKENS[model];

  if (!price) {
    return null;
  }

  return (usage.inputTokens / 1_000) * price.input + (usage.outputTokens / 1_000) * price.output;
}
