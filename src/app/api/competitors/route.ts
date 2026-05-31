import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/api/errors";
import { competitorCreateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    return prisma.competitor.findMany({
      where: { store: { organizationId: context.organizationId } },
      include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 }, store: true },
      orderBy: { createdAt: "desc" },
    });
  }),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(competitorCreateSchema, async (_request, context) => {
      const store = await prisma.store.findFirst({
        where: { id: context.input.storeId, organizationId: context.organizationId },
        select: { id: true },
      });

      if (!store) {
        throw new NotFoundError("Store not found");
      }

      return prisma.competitor.create({ data: context.input });
    }),
  ),
);
