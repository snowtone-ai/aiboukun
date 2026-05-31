import { z } from "zod";

export const insightOutputSchema = z.object({
  summary: z.string().min(1).max(1_000),
  positives: z.array(z.string()).max(10),
  negatives: z.array(z.string()).max(10),
  topics: z.array(z.object({ label: z.string(), count: z.number().int().min(0) })).max(20),
  recommendedTasks: z.array(z.string()).max(5),
});

export type InsightPromptInput = {
  storeName?: string;
  periodLabel: string;
  reviews: Array<{ rating: number; text?: string | null; postedAt?: Date | string }>;
};

export function buildInsightPrompt(input: InsightPromptInput) {
  const reviewLines = input.reviews
    .slice(0, 50)
    .map((review, index) => `${index + 1}. rating=${review.rating}; text=${review.text?.trim() || "(no text)"}`)
    .join("\n");

  return {
    system:
      "You analyze Japanese Google reviews for store operators. Focus on actionable themes, not generic advice. Return only JSON.",
    user: [`Store: ${input.storeName ?? "(all stores)"}`, `Period: ${input.periodLabel}`, "Reviews:", reviewLines].join("\n"),
  };
}
