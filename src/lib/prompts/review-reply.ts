import { z } from "zod";

export const reviewReplyOutputSchema = z.object({
  reply: z.string().min(1).max(2_000),
  requiresApproval: z.boolean(),
  riskNotes: z.array(z.string()).max(8),
  tone: z.enum(["polite", "warm", "concise"]),
});

export type ReviewReplyPromptInput = {
  storeName: string;
  industry?: string;
  rating: number;
  reviewText?: string | null;
  styleNotes?: string[];
  ngWords?: string[];
};

export function buildReviewReplyPrompt(input: ReviewReplyPromptInput) {
  return {
    system:
      "You draft Japanese owner replies for Google reviews. Never claim facts not provided. For ratings 1-3 or legal/medical/privacy/escalation risk, requiresApproval must be true. Return only JSON.",
    user: [
      `Store: ${input.storeName}`,
      `Industry: ${input.industry ?? "OTHER"}`,
      `Rating: ${input.rating}`,
      `Review: ${input.reviewText?.trim() || "(no text)"}`,
      `Style notes: ${input.styleNotes?.join(", ") || "warm, concise, sincere"}`,
      `NG words: ${input.ngWords?.join(", ") || "(none)"}`,
      "Draft a reply that is specific, calm, and suitable for public Google Maps display.",
    ].join("\n"),
  };
}
