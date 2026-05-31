import { z } from "zod";

export const riskDetectionOutputSchema = z.object({
  level: z.enum(["NORMAL", "ATTENTION", "URGENT", "LEGAL", "MEDICAL", "PRIVACY", "SAFETY"]),
  reasons: z.array(z.string()).max(8),
  requiresApproval: z.boolean(),
  autoReplyAllowed: z.boolean(),
  recommendedAction: z.string().min(1).max(300),
  confidence: z.number().min(0).max(1),
});

export type RiskDetectionPromptInput = {
  rating: number;
  text?: string | null;
  industry?: string;
};

export function buildRiskDetectionPrompt(input: RiskDetectionPromptInput) {
  return {
    system:
      "You classify Japanese Google reviews for a local business. Never allow automatic replies for legal, medical, privacy, safety, or escalation risk. Return only the requested JSON shape.",
    user: [
      `Industry: ${input.industry ?? "OTHER"}`,
      `Rating: ${input.rating}`,
      `Review text: ${input.text?.trim() || "(no text)"}`,
      "Classify risk level, approval need, and recommended next action in Japanese.",
    ].join("\n"),
  };
}
