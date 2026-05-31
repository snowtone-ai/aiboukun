import { chatMessageSchema } from "@/lib/validators/chat";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

export const POST = createRouteHandler(
  withOrg(
    withValidation(chatMessageSchema, async (_request, context) => {
      const orchestrator = new AgentOrchestrator();

      return orchestrator.run({
        organizationId: context.organizationId!,
        userId: context.session!.user.id,
        storeId: context.input.storeId,
        message: context.input.message,
      });
    }),
  ),
);
