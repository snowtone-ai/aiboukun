import { prisma } from "@/lib/prisma/client";

type TaskAgentInput = {
  storeId: string;
  lowRatingCount?: number;
  unrepliedCount?: number;
  competitorWeaknesses?: string[];
};

export class TaskAgent {
  async generate(input: TaskAgentInput) {
    const tasks = buildTasks(input);

    if (tasks.length === 0) {
      return [];
    }

    return prisma.task.createManyAndReturn({
      data: tasks.map((task) => ({
        storeId: input.storeId,
        title: task.title,
        detail: task.detail,
        type: task.type,
        priority: task.priority,
        dueDate: task.dueDate,
      })),
    });
  }
}

export function buildTasks(input: TaskAgentInput) {
  const dueSoon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1_000);
  const tasks: Array<{
    title: string;
    detail?: string;
    type: "REVIEW_REPLY" | "RISK_RESPONSE" | "SERVICE_IMPROVEMENT" | "COMPETITOR_ACTION";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: Date;
  }> = [];

  if ((input.lowRatingCount ?? 0) > 0) {
    tasks.push({
      title: "低評価口コミを確認する",
      detail: `星3以下の口コミが${input.lowRatingCount}件あります。返信前に事実確認してください。`,
      type: "RISK_RESPONSE",
      priority: (input.lowRatingCount ?? 0) >= 3 ? "URGENT" : "HIGH",
      dueDate: dueSoon,
    });
  }

  if ((input.unrepliedCount ?? 0) > 0) {
    tasks.push({
      title: "未返信口コミに返信する",
      detail: `未返信口コミが${input.unrepliedCount}件あります。`,
      type: "REVIEW_REPLY",
      priority: "MEDIUM",
      dueDate: dueSoon,
    });
  }

  for (const weakness of input.competitorWeaknesses?.slice(0, 3) ?? []) {
    tasks.push({
      title: `競合対策: ${weakness}`,
      type: "COMPETITOR_ACTION",
      priority: "MEDIUM",
    });
  }

  return tasks.slice(0, 5);
}
