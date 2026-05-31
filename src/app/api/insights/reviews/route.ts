import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { insightQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      insightQuerySchema,
      async (_request, context) => {
        const days = context.input.period === "180d" ? 180 : context.input.period === "90d" ? 90 : 30;
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1_000);
        return prisma.review.findMany({
          where: {
            store: { organizationId: context.organizationId },
            ...(context.input.storeId ? { storeId: context.input.storeId } : {}),
            postedAt: { gte: from },
          },
          include: { store: { select: { id: true, name: true } } },
          orderBy: { postedAt: "desc" },
          take: 100,
        });
      },
      "query",
    ),
  ),
);
