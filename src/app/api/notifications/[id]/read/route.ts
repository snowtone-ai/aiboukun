import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";
import { markNotificationRead } from "@/lib/notifications/service";

export const POST = createRouteHandler(
  withOrg(
    withValidation(routeParamsSchema, async (_request, context) => {
      const result = await markNotificationRead(context.input.id, context.organizationId!);
      return { updated: result.count };
    }, "params"),
  ),
);
