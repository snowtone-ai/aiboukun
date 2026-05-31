import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { storeCreateSchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    const stores = await prisma.store.findMany({
      where: { organizationId: context.organizationId },
      include: {
        brand: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
        _count: { select: { reviews: true, tasks: true, competitors: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const stats = await Promise.all(
      stores.map(async (store) => {
        const [average, lowRatingCount, unrepliedCount] = await Promise.all([
          prisma.review.aggregate({ where: { storeId: store.id }, _avg: { rating: true } }),
          prisma.review.count({ where: { storeId: store.id, rating: { lte: 3 } } }),
          prisma.review.count({ where: { storeId: store.id, replyStatus: "UNREPLIED" } }),
        ]);
        return {
          ...store,
          averageRating: average._avg.rating ?? 0,
          lowRatingCount,
          unrepliedCount,
        };
      }),
    );

    return stats;
  }),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(storeCreateSchema, (_request, context) => {
      return prisma.store.create({
        data: {
          organizationId: context.organizationId!,
          ...context.input,
        },
      });
    }),
  ),
);
