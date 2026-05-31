import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { GoogleBusinessProfileClient } from "@/lib/google/gbp-client";
import { logAudit } from "@/lib/audit/logger";
import { routeParamsSchema } from "@/lib/validators/common";
import { prisma } from "@/lib/prisma/client";

export const POST = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        assertPermission(context.session!.role, "MANAGER");
        const draft = await prisma.replyDraft.findFirst({
          where: { id: context.input.id, review: { store: { organizationId: context.organizationId } } },
          include: { review: { include: { store: { include: { gbp: true } } } } },
        });

        if (!draft) {
          throw new NotFoundError("Reply draft not found");
        }
        if (draft.status !== "APPROVED") {
          throw new ForbiddenError("Google投稿の前に人の承認が必要です");
        }
        if (draft.requiresApproval && !draft.approvedAt) {
          throw new ForbiddenError("Google投稿の前に人の承認が必要です");
        }
        if (draft.review.rating <= 3 || ["LEGAL", "MEDICAL", "PRIVACY", "SAFETY"].includes(draft.riskLevel)) {
          throw new ForbiddenError("低評価または高リスク口コミは自動投稿できません。Google管理画面で最終確認してください");
        }
        if (!draft.review.store.gbp) {
          throw new NotFoundError("Google Business Profile location is not linked");
        }

        const connection = await prisma.googleConnection.findFirst({
          where: { organizationId: context.organizationId },
          orderBy: { updatedAt: "desc" },
        });
        if (!connection) {
          throw new NotFoundError("Google connection not found");
        }

        const lock = await prisma.replyDraft.updateMany({
          where: {
            id: draft.id,
            status: "APPROVED",
            approvedAt: { not: null },
            review: { store: { organizationId: context.organizationId } },
          },
          data: { status: "POSTING" },
        });

        if (lock.count !== 1) {
          throw new ConflictError("This reply draft is already being posted or is no longer approved");
        }

        const body = draft.ownerFinalText ?? draft.aiInitialText;
        const client = new GoogleBusinessProfileClient({
          organizationId: context.organizationId,
          accessTokenEnc: connection.accessTokenEnc,
        });

        try {
          const googleReply = await client.updateReviewReply(draft.review.googleReviewName, body);

          const [reply] = await prisma.$transaction([
            prisma.reviewReply.create({
              data: {
                reviewId: draft.reviewId,
                googleReplyName: googleReply.name,
                text: body,
                postedByUserId: context.session!.user.id,
                postedAt: new Date(),
                raw: googleReply,
              },
            }),
            prisma.replyDraft.update({ where: { id: draft.id }, data: { status: "POSTED" } }),
            prisma.review.update({ where: { id: draft.reviewId }, data: { replyStatus: "POSTED" } }),
          ]);

          await logAudit({
            organizationId: context.organizationId!,
            actorUserId: context.session!.user.id,
            action: "REPLY_POSTED",
            targetType: "Review",
            targetId: draft.reviewId,
            after: { replyId: reply.id },
          });

          return reply;
        } catch (error) {
          await prisma.replyDraft.updateMany({
            where: { id: draft.id, status: "POSTING" },
            data: { status: "APPROVED" },
          });
          throw error;
        }
      },
      "params",
    ),
  ),
);
