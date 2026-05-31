import { z } from "zod";

export const reportOutputSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  markdown: z.string().min(1).max(20_000),
});

export type ReportPromptInput = {
  title: string;
  periodLabel: string;
  metrics: Record<string, string | number>;
  insightSummary: string;
  recommendedTasks: string[];
};

export function buildReportPrompt(input: ReportPromptInput) {
  return {
    system:
      "You write concise Japanese business reports for local store operators. Put the conclusion first, then numbers, positives, cautions, hypotheses, and exactly three next actions. Return JSON.",
    user: [
      `Title hint: ${input.title}`,
      `Period: ${input.periodLabel}`,
      `Metrics: ${JSON.stringify(input.metrics)}`,
      `Insight: ${input.insightSummary}`,
      `Recommended tasks: ${input.recommendedTasks.join(" / ")}`,
    ].join("\n"),
  };
}
