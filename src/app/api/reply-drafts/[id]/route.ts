import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { learnReplyStyle } from "@/lib/agents/memory-agent";
import { logAudit } from "@/lib/audit/logger";
import { routeParamsSchema } from "@/lib/validators/common";
import { draftPatchSchema } from "@/lib/validators/workflows";

export const PATCH = createRouteHandler(
  withOrg(
    withValidation(draftPatchSchema, async (_request, context) => {
      const params = routeParamsSchema.parse(context.params);
      const draft = await prisma.replyDraft.findFirst({
        where: { id: params.id, review: { store: { organizationId: context.organizationId } } },
      });

      if (!draft) {
        throw new NotFoundError("Reply draft not found");
      }

      const updated = await prisma.replyDraft.update({
        where: { id: draft.id },
        data: {
          ...(context.input.body ? { ownerFinalText: context.input.body, status: "EDITED" as const } : {}),
          ...(context.input.status ? { status: context.input.status } : {}),
        },
      });

      if (context.input.body && context.input.body !== draft.aiInitialText) {
        await learnReplyStyle({
          draftId: draft.id,
          organizationId: context.organizationId!,
          userId: context.session!.user.id,
        });
        await logAudit({
          organizationId: context.organizationId!,
          actorUserId: context.session!.user.id,
          action: "REPLY_DRAFT_EDITED",
          targetType: "ReplyDraft",
          targetId: draft.id,
          before: { ownerFinalText: draft.ownerFinalText },
          after: { ownerFinalText: context.input.body },
        });
      }

      return updated;
    }),
  ),
);
