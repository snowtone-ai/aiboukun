import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { createNotification, listNotifications } from "@/lib/notifications/service";
import { notificationCreateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg((_request, context) => {
    return listNotifications(context.organizationId, context.session.user.id);
  }),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(notificationCreateSchema, (_request, context) => {
      return createNotification({
        organizationId: context.organizationId!,
        ...context.input,
      });
    }),
  ),
);
