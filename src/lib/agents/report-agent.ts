import { prisma } from "@/lib/prisma/client";
import type { LLMProvider } from "@/lib/llm/provider";
import { logLLMResult } from "@/lib/llm/usage-logger";
import { buildReportPrompt, reportOutputSchema, type ReportPromptInput } from "@/lib/prompts/report";

type ReportInput = ReportPromptInput & {
  organizationId: string;
  storeId?: string;
  type: "WEEKLY" | "MONTHLY" | "HQ" | "STORE_MANAGER";
  periodStart: Date;
  periodEnd: Date;
};

export class ReportAgent {
  constructor(private readonly llm?: LLMProvider) {}

  async generate(input: ReportInput) {
    const report = this.llm ? await this.generateWithLLM(input) : buildFallbackReport(input);

    return prisma.report.create({
      data: {
        organizationId: input.organizationId,
        storeId: input.storeId,
        type: input.type,
        title: report.title,
        summary: report.summary,
        markdown: report.markdown,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      },
    });
  }

  private async generateWithLLM(input: ReportInput) {
    const prompt = buildReportPrompt(input);
    const request = {
      purpose: "report_generation",
      temperature: 0.3,
      messages: [
        { role: "system" as const, content: prompt.system },
        { role: "user" as const, content: prompt.user },
      ],
    };
    const result = await this.llm!.generateJson(request, reportOutputSchema);
    await logLLMResult(request, result, input.organizationId);

    return result.data;
  }
}

function buildFallbackReport(input: ReportInput) {
  const actions = input.recommendedTasks.slice(0, 3);
  const markdown = [
    `# ${input.title}`,
    "",
    `## 結論`,
    input.insightSummary,
    "",
    "## 数字",
    ...Object.entries(input.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## やるべきこと",
    ...actions.map((task, index) => `${index + 1}. ${task}`),
  ].join("\n");

  return {
    title: input.title,
    summary: input.insightSummary,
    markdown,
  };
}
