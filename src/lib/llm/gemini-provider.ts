import { GoogleGenerativeAI, type Content, type GenerationConfig } from "@google/generative-ai";
import { ZodError, type z } from "zod";
import {
  LLMProviderError,
  type LLMJsonResult,
  type LLMMessage,
  type LLMProvider,
  type LLMRequest,
  type LLMTextResult,
} from "./provider";

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 3;

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  readonly model: string;
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string, model = process.env.LLM_MODEL ?? DEFAULT_MODEL) {
    if (!apiKey) {
      throw new LLMProviderError("GEMINI_API_KEY is required", this.name);
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateText(request: LLMRequest): Promise<LLMTextResult> {
    const result = await this.generateContent(request);

    return {
      text: result.text,
      model: this.model,
      provider: this.name,
      usage: result.usage,
    };
  }

  async generateJson<TSchema extends z.ZodType>(
    request: LLMRequest,
    schema: TSchema,
  ): Promise<LLMJsonResult<z.output<TSchema>>> {
    const result = await this.generateContent(request, true);
    const parsed = parseJson(result.text);
    const validated = schema.parse(parsed);

    return {
      data: validated,
      rawText: result.text,
      model: this.model,
      provider: this.name,
      usage: result.usage,
    };
  }

  classify<TSchema extends z.ZodType>(
    request: LLMRequest,
    schema: TSchema,
  ): Promise<LLMJsonResult<z.output<TSchema>>> {
    return this.generateJson({ ...request, temperature: request.temperature ?? 0 }, schema);
  }

  private async generateContent(request: LLMRequest, jsonMode = false) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: toGenerationConfig(request, jsonMode),
      systemInstruction: getSystemInstruction(request.messages),
    });
    const contents = toContents(request.messages);

    return withRetry(async () => {
      const response = await model.generateContent({ contents });
      const usage = response.response.usageMetadata;

      return {
        text: response.response.text(),
        usage: usage
          ? {
              inputTokens: usage.promptTokenCount ?? 0,
              outputTokens: usage.candidatesTokenCount ?? 0,
              totalTokens: usage.totalTokenCount ?? 0,
            }
          : undefined,
      };
    }, this.name);
  }
}

function toGenerationConfig(request: LLMRequest, jsonMode = false): GenerationConfig {
  return {
    temperature: request.temperature,
    maxOutputTokens: request.maxOutputTokens,
    responseMimeType: jsonMode ? "application/json" : undefined,
  };
}

function getSystemInstruction(messages: LLMMessage[]) {
  const systemText = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");

  return systemText || undefined;
}

function toContents(messages: LLMMessage[]): Content[] {
  const nonSystemMessages = messages.filter((message) => message.role !== "system");

  return nonSystemMessages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function parseJson(text: string): unknown {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(withoutFence);
}

async function withRetry<T>(operation: () => Promise<T>, provider: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError) {
        throw error;
      }

      lastError = error;

      if (attempt < MAX_RETRIES) {
        await delay(250 * 2 ** (attempt - 1));
      }
    }
  }

  throw new LLMProviderError("LLM request failed", provider, lastError);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
