import { createRouteHandler, withOrg } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    const actions = await prisma.agentAction.findMany({
      where: {
        organizationId: context.organizationId,
        agent: "ORCHESTRATOR",
        actionType: "CHAT_COMMAND",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      messages: actions.reverse().flatMap((action) => {
        const input = action.input as { message?: string };
        const output = action.output as { message?: string } | null;

        return [
          {
            id: `${action.id}:user`,
            role: "user",
            content: input.message ?? "",
            createdAt: action.createdAt,
          },
          {
            id: `${action.id}:assistant`,
            role: "assistant",
            content: output?.message ?? action.errorMessage ?? "処理中です。",
            createdAt: action.createdAt,
          },
        ];
      }),
    };
  }),
);
