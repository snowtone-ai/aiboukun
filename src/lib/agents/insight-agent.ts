import { prisma } from "@/lib/prisma/client";
import type { LLMProvider } from "@/lib/llm/provider";
import { logLLMResult } from "@/lib/llm/usage-logger";
import { buildInsightPrompt, insightOutputSchema, type InsightPromptInput } from "@/lib/prompts/insight";

type InsightInput = InsightPromptInput & {
  organizationId: string;
  storeId?: string;
  periodStart: Date;
  periodEnd: Date;
};

export class InsightAgent {
  constructor(private readonly llm?: LLMProvider) {}

  async analyze(input: InsightInput) {
    const fallback = analyzeByRules(input);

    if (!this.llm || input.reviews.length === 0) {
      return this.persist(input, fallback);
    }

    const prompt = buildInsightPrompt(input);
    const request = {
      purpose: "insight_analysis",
      temperature: 0.2,
      messages: [
        { role: "system" as const, content: prompt.system },
        { role: "user" as const, content: prompt.user },
      ],
    };
    const result = await this.llm.generateJson(request, insightOutputSchema);
    await logLLMResult(request, result, input.organizationId);

    return this.persist(input, result.data);
  }

  private async persist(input: InsightInput, data: ReturnType<typeof analyzeByRules>) {
    return prisma.insight.create({
      data: {
        organizationId: input.organizationId,
        storeId: input.storeId,
        type: "REVIEW_SUMMARY",
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        summary: data.summary,
        data,
      },
    });
  }
}

export function analyzeByRules(input: Pick<InsightInput, "reviews">) {
  const total = input.reviews.length;
  const average = total ? input.reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
  const low = input.reviews.filter((review) => review.rating <= 3).length;
  const positives = total && average >= 4 ? ["高評価の比率が高い状態です"] : [];
  const negatives = low > 0 ? [`星3以下の口コミが${low}件あります`] : [];

  return {
    summary: total
      ? `対象期間の口コミは${total}件、平均評価は${average.toFixed(1)}です。`
      : "対象期間の口コミはまだありません。",
    positives,
    negatives,
    topics: collectTopics(input.reviews.map((review) => review.text ?? "")),
    recommendedTasks: low > 0 ? ["低評価口コミを確認する", "返信漏れを減らす", "改善内容を店内で共有する"] : ["高評価口コミへの返信を継続する"],
  };
}

function collectTopics(texts: string[]) {
  const keywords = ["接客", "味", "料金", "待ち時間", "清潔", "雰囲気", "予約", "スタッフ"];

  return keywords
    .map((label) => ({ label, count: texts.filter((text) => text.includes(label)).length }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count);
}
