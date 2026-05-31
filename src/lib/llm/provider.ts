import type { z } from "zod";

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type LLMRequest = {
  messages: LLMMessage[];
  /**
   * Stable business purpose used by usage logging, audit correlation, and cost reporting.
   * Providers should pass this through unchanged rather than interpreting it as prompt text.
   */
  purpose: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type LLMTextResult = {
  text: string;
  model: string;
  provider: string;
  usage?: TokenUsage;
};

export type LLMJsonResult<T> = {
  data: T;
  rawText: string;
  model: string;
  provider: string;
  usage?: TokenUsage;
};

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  generateText(request: LLMRequest): Promise<LLMTextResult>;
  generateJson<TSchema extends z.ZodType>(
    request: LLMRequest,
    schema: TSchema,
  ): Promise<LLMJsonResult<z.output<TSchema>>>;
  classify<TSchema extends z.ZodType>(
    request: LLMRequest,
    schema: TSchema,
  ): Promise<LLMJsonResult<z.output<TSchema>>>;
}

export class LLMProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LLMProviderError";
  }
}
