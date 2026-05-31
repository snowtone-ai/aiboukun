import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { syncReviewsForStore } from "@/lib/google/review-sync";
import { googleSyncSchema } from "@/lib/validators/workflows";
import { logAudit } from "@/lib/audit/logger";

export const POST = createRouteHandler(
  withOrg(
    withValidation(googleSyncSchema, async (_request, context) => {
      assertPermission(context.session!.role, "MANAGER");

      const result = await syncReviewsForStore(context.input.storeId, context.organizationId!, {
        pageToken: context.input.pageToken,
      });
      await logAudit({
        organizationId: context.organizationId!,
        actorUserId: context.session!.user.id,
        action: "GOOGLE_REVIEWS_SYNCED",
        targetType: "Store",
        targetId: context.input.storeId,
        after: result,
      });
      return result;
    }),
  ),
);
