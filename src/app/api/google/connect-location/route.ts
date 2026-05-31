import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { connectLocationSchema } from "@/lib/validators/workflows";
import { logAudit } from "@/lib/audit/logger";

export const POST = createRouteHandler(
  withOrg(
    withValidation(connectLocationSchema, async (_request, context) => {
      assertPermission(context.session!.role, "ADMIN");

      const store = await prisma.store.findFirst({
        where: { id: context.input.storeId, organizationId: context.organizationId },
      });

      if (!store) {
        throw new NotFoundError("Store not found");
      }

      const gbp = await prisma.googleBusinessProfile.upsert({
        where: { storeId: store.id },
        update: {
          googleAccountName: context.input.googleAccountName,
          googleLocationName: context.input.googleLocationName,
          placeId: context.input.placeId,
          title: context.input.title,
          verified: context.input.verified,
          raw: context.input.raw as object | undefined,
        },
        create: {
          storeId: store.id,
          googleAccountName: context.input.googleAccountName,
          googleLocationName: context.input.googleLocationName,
          placeId: context.input.placeId,
          title: context.input.title,
          verified: context.input.verified,
          raw: context.input.raw as object | undefined,
        },
      });

      await logAudit({
        organizationId: context.organizationId!,
        actorUserId: context.session!.user.id,
        action: "GOOGLE_LOCATION_LINKED",
        targetType: "Store",
        targetId: store.id,
        after: { googleLocationName: gbp.googleLocationName },
      });

      return gbp;
    }),
  ),
);
