import { NavigationAgent } from "@/lib/agents/navigation-agent";
import { createLLMProvider } from "@/lib/llm/llm-router";
import { prisma } from "@/lib/prisma/client";
import type { AgentRunInput, AgentRunResult, ParsedCommand } from "@/types/domain";

type OrchestratorOptions = {
  useLLM?: boolean;
};

export class AgentOrchestrator {
  private readonly navigationAgent: NavigationAgent;

  constructor(options: OrchestratorOptions = {}) {
    this.navigationAgent = new NavigationAgent(options.useLLM ? createLLMProvider() : undefined);
  }

  async run(input: AgentRunInput): Promise<AgentRunResult<{ command: ParsedCommand }>> {
    const message = input.message?.trim();

    if (!message) {
      return {
        ok: false,
        message: "依頼内容を入力してください。",
      };
    }

    const action = await prisma.agentAction.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        agent: "ORCHESTRATOR",
        actionType: "CHAT_COMMAND",
        input: { message, storeId: input.storeId },
        status: "RUNNING",
      },
    });

    try {
      const command = await this.navigationAgent.parse(message, input.organizationId);
      const resultMessage = await this.buildResponse(input.organizationId, command);

      const completedAction = await prisma.agentAction.update({
        where: { id: action.id },
        data: {
          status: "COMPLETED",
          output: { message: resultMessage, command },
          requiresApproval: command.intent === "generate_reply_drafts" || command.intent === "approve_reply",
        },
      });

      return {
        ok: true,
        message: resultMessage,
        data: { command },
        actions: [completedAction],
      };
    } catch (error) {
      await prisma.agentAction.update({
        where: { id: action.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  private async buildResponse(organizationId: string, command: ParsedCommand) {
    switch (command.intent) {
      case "filter_reviews": {
        const ratings = command.ratings?.length ? command.ratings : [1, 2, 3];
        const count = await prisma.review.count({
          where: {
            store: { organizationId },
            rating: { in: ratings },
          },
        });

        return `${ratings.join(", ")}星の口コミが${count}件あります。口コミ画面で絞り込み条件を引き継げます。`;
      }
      case "generate_reply_drafts": {
        const count = await prisma.review.count({
          where: {
            store: { organizationId },
            replyStatus: "UNREPLIED",
          },
        });

        return `未返信の口コミが${count}件あります。星1-3やリスクありの返信は、人の承認が必要です。`;
      }
      case "generate_report":
        return "レポート作成の準備ができます。対象期間と店舗を指定すると、週次・月次レポートを生成できます。";
      case "compare_competitors":
        return "競合比較を開始できます。競合店舗の登録とスナップショットをもとに、強み・弱みを整理します。";
      case "show_tasks": {
        const count = await prisma.task.count({
          where: { store: { organizationId }, status: { in: ["TODO", "DOING"] } },
        });

        return `未完了タスクが${count}件あります。優先度の高いものから確認しましょう。`;
      }
      default:
        return "内容を受け取りました。口コミ確認、返信案作成、レポート作成、競合比較のように依頼できます。";
    }
  }
}
