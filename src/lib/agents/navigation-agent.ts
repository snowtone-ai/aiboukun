import type { z } from "zod";
import type { LLMProvider } from "@/lib/llm/provider";
import { logLLMResult } from "@/lib/llm/usage-logger";
import { buildIntentParserPrompt, intentParserOutputSchema } from "@/lib/prompts/intent-parser";
import type { ParsedCommand } from "@/types/domain";

export class NavigationAgent {
  constructor(private readonly llm?: LLMProvider) {}

  async parse(message: string, organizationId?: string): Promise<ParsedCommand> {
    const ruleResult = parseByRules(message);

    if (!this.llm || ruleResult.intent !== "unknown") {
      return ruleResult;
    }

    const prompt = buildIntentParserPrompt(message);
    const request = {
      purpose: "intent_parser",
      temperature: 0,
      messages: [
        { role: "system" as const, content: prompt.system },
        { role: "user" as const, content: prompt.user },
      ],
    };
    const result = await this.llm.classify(request, intentParserOutputSchema);
    await logLLMResult(request, result, organizationId);

    return toParsedCommand(result.data);
  }
}

export function parseByRules(message: string): ParsedCommand {
  const ratings = [...message.matchAll(/[1１2２3３4４5５] ?(?:星|スター)/g)].map((match) =>
    Number(match[0].replace(/[^\d１２３４５]/g, "").replace(/[１２３４５]/g, (char) => String("１２３４５".indexOf(char) + 1))),
  );

  if (/口コミ|レビュー/.test(message) && /悪い|低評価|不満/.test(message)) {
    return { intent: "filter_reviews", ratings: ratings.length ? ratings : [1, 2, 3] };
  }

  if (/返信|返事/.test(message) && /作|生成|下書き/.test(message)) {
    return { intent: "generate_reply_drafts" };
  }

  if (/レポート|報告/.test(message)) {
    return { intent: "generate_report" };
  }

  if (/競合|ライバル/.test(message)) {
    return { intent: "compare_competitors" };
  }

  if (/タスク|やること|TODO/i.test(message)) {
    return { intent: "show_tasks" };
  }

  return { intent: "unknown" };
}

function toParsedCommand(data: z.output<typeof intentParserOutputSchema>): ParsedCommand {
  return {
    intent: data.intent,
    ratings: data.ratings,
    route: data.route,
    action: data.action,
    filters: data.filters,
  };
}
