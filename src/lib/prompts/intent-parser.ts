import { z } from "zod";

export const intentParserOutputSchema = z.object({
  intent: z.enum([
    "show_reviews",
    "filter_reviews",
    "generate_reply_drafts",
    "approve_reply",
    "generate_report",
    "compare_competitors",
    "show_tasks",
    "create_task",
    "navigate",
    "unknown",
  ]),
  storeName: z.string().optional(),
  ratings: z.array(z.number().int().min(1).max(5)).optional(),
  route: z.string().optional(),
  action: z.string().optional(),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.array(z.number())])).optional(),
});

export function buildIntentParserPrompt(message: string) {
  return {
    system:
      "You parse Japanese commands for a Google Maps marketing assistant. Return a compact JSON command. Do not invent ids.",
    user: `User message: ${message}`,
  };
}
