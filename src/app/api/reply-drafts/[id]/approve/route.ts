import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit/logger";
import { routeParamsSchema } from "@/lib/validators/common";

export const POST = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        assertPermission(context.session!.role, "MANAGER");
        const draft = await prisma.replyDraft.findFirst({
          where: { id: context.input.id, review: { store: { organizationId: context.organizationId } } },
          include: { review: true },
        });

        if (!draft) {
          throw new NotFoundError("Reply draft not found");
        }

        const updated = await prisma.replyDraft.update({
          where: { id: draft.id },
          data: {
            status: "APPROVED",
            approvedByUserId: context.session!.user.id,
            approvedAt: new Date(),
          },
        });
        await prisma.review.update({ where: { id: draft.reviewId }, data: { replyStatus: "APPROVED" } });
        await logAudit({
          organizationId: context.organizationId!,
          actorUserId: context.session!.user.id,
          action: "REPLY_DRAFT_APPROVED",
          targetType: "ReplyDraft",
          targetId: draft.id,
          after: { reviewId: draft.reviewId },
        });

        return updated;
      },
      "params",
    ),
  ),
);
