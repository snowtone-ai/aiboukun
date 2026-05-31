import type { z } from "zod";
import { buildRiskDetectionPrompt, riskDetectionOutputSchema } from "@/lib/prompts/risk-detection";
import type { LLMProvider } from "@/lib/llm/provider";
import { logLLMResult } from "@/lib/llm/usage-logger";
import type { RiskClassification } from "@/types/domain";

type ReviewRiskInput = {
  organizationId: string;
  reviewId?: string;
  rating: number;
  text?: string | null;
  industry?: string;
};

type RiskDetectionResult = z.output<typeof riskDetectionOutputSchema>;

export class RiskDetectionAgent {
  constructor(private readonly llm?: LLMProvider) {}

  async classify(input: ReviewRiskInput): Promise<RiskDetectionResult> {
    const ruleResult = classifyByRules(input);

    if (!this.llm || ruleResult.level !== "NORMAL") {
      return this.persistIfNeeded(input, ruleResult);
    }

    const prompt = buildRiskDetectionPrompt(input);
    const request = {
      purpose: "risk_detection",
      temperature: 0,
      messages: [
        { role: "system" as const, content: prompt.system },
        { role: "user" as const, content: prompt.user },
      ],
    };
    const result = await this.llm.classify(request, riskDetectionOutputSchema);
    await logLLMResult(request, result, input.organizationId);

    return this.persistIfNeeded(input, strengthenWithRules(input, result.data));
  }

  private async persistIfNeeded(input: ReviewRiskInput, result: RiskDetectionResult) {
    if (!input.reviewId) {
      return result;
    }

    const { prisma } = await import("@/lib/prisma/client");

    await prisma.$transaction([
      prisma.review.update({
        where: { id: input.reviewId },
        data: { riskLevel: result.level },
      }),
      prisma.riskFlag.create({
        data: {
          reviewId: input.reviewId,
          level: result.level,
          reasons: result.reasons,
          autoReplyAllowed: result.autoReplyAllowed,
          approvalRequired: result.requiresApproval,
          recommendedAction: result.recommendedAction,
        },
      }),
    ]);

    return result;
  }
}

export function classifyByRules(input: Pick<ReviewRiskInput, "rating" | "text">): RiskDetectionResult {
  const text = input.text ?? "";
  const reasons: string[] = [];
  let level: RiskClassification["level"] = "NORMAL";

  if (input.rating <= 2) {
    level = "ATTENTION";
    reasons.push("低評価レビューです");
  }

  if (/返金|事故|怪我|けが|食中毒|炎上|警察|訴訟|弁護士|違法/.test(text)) {
    level = "URGENT";
    reasons.push("早急な個別対応が必要な表現を含みます");
  }

  if (/訴訟|弁護士|法的|違法|裁判/.test(text)) {
    level = "LEGAL";
    reasons.push("法務リスクの可能性があります");
  }

  if (/病院|治療|薬|診断|医師|歯科|医療/.test(text)) {
    level = "MEDICAL";
    reasons.push("医療関連の表現を含みます");
  }

  if (/個人情報|住所|電話番号|氏名|晒/.test(text)) {
    level = "PRIVACY";
    reasons.push("個人情報・プライバシーリスクの可能性があります");
  }

  return {
    level,
    reasons: reasons.length ? reasons : ["通常の口コミです"],
    requiresApproval: level !== "NORMAL" || input.rating <= 3,
    autoReplyAllowed: level === "NORMAL" && input.rating >= 4,
    recommendedAction: level === "NORMAL" ? "通常の返信案を作成してください" : "オーナーが内容を確認してから返信してください",
    confidence: reasons.length ? 0.9 : 0.7,
  };
}

function strengthenWithRules(input: ReviewRiskInput, llmResult: RiskDetectionResult): RiskDetectionResult {
  const ruleResult = classifyByRules(input);

  if (riskRank(ruleResult.level) > riskRank(llmResult.level)) {
    return ruleResult;
  }

  return {
    ...llmResult,
    requiresApproval: llmResult.requiresApproval || ruleResult.requiresApproval,
    autoReplyAllowed: llmResult.autoReplyAllowed && ruleResult.autoReplyAllowed,
    reasons: Array.from(new Set([...llmResult.reasons, ...ruleResult.reasons])).slice(0, 8),
  };
}

function riskRank(level: RiskClassification["level"]) {
  return ["NORMAL", "ATTENTION", "URGENT", "LEGAL", "MEDICAL", "PRIVACY", "SAFETY"].indexOf(level);
}
