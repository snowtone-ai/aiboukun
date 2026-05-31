import type { z } from "zod";
import type { LLMProvider } from "@/lib/llm/provider";
import { logLLMResult } from "@/lib/llm/usage-logger";
import { buildReviewReplyPrompt, reviewReplyOutputSchema } from "@/lib/prompts/review-reply";
import { classifyByRules } from "./risk-detection-agent";

type ReviewReplyInput = {
  organizationId: string;
  reviewId?: string;
  storeName: string;
  industry?: string;
  rating: number;
  reviewText?: string | null;
  styleNotes?: string[];
  ngWords?: string[];
};

type ReviewReplyResult = z.output<typeof reviewReplyOutputSchema> & {
  draftId?: string;
};

export class ReviewReplyAgent {
  constructor(private readonly llm: LLMProvider) {}

  async generate(input: ReviewReplyInput): Promise<ReviewReplyResult> {
    const prompt = buildReviewReplyPrompt(input);
    const request = {
      purpose: "review_reply",
      temperature: 0.4,
      messages: [
        { role: "system" as const, content: prompt.system },
        { role: "user" as const, content: prompt.user },
      ],
    };
    const result = await this.llm.generateJson(request, reviewReplyOutputSchema);
    await logLLMResult(request, result, input.organizationId);

    const guarded = applyReplySafety(input, result.data);

    if (!input.reviewId) {
      return guarded;
    }

    const { prisma } = await import("@/lib/prisma/client");

    const draft = await prisma.replyDraft.create({
      data: {
        reviewId: input.reviewId,
        aiInitialText: guarded.reply,
        riskLevel: classifyByRules({ rating: input.rating, text: input.reviewText }).level,
        requiresApproval: guarded.requiresApproval,
      },
    });

    await prisma.review.update({
      where: { id: input.reviewId },
      data: { replyStatus: "DRAFTED" },
    });

    return { ...guarded, draftId: draft.id };
  }
}

export function applyReplySafety(
  input: Pick<ReviewReplyInput, "rating" | "reviewText" | "ngWords">,
  result: z.output<typeof reviewReplyOutputSchema>,
): z.output<typeof reviewReplyOutputSchema> {
  const risk = classifyByRules({ rating: input.rating, text: input.reviewText });
  const ngHits = (input.ngWords ?? []).filter((word) => word && result.reply.includes(word));
  const riskNotes = Array.from(new Set([...result.riskNotes, ...risk.reasons, ...ngHits.map((word) => `NG word: ${word}`)]));

  return {
    ...result,
    requiresApproval: result.requiresApproval || risk.requiresApproval || ngHits.length > 0,
    riskNotes: riskNotes.slice(0, 8),
  };
}
