import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { reviewListQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      reviewListQuerySchema,
      async (_request, context) => {
        const { page, pageSize, storeId, ratings, replyStatus, riskLevel, q, from, to } = context.input;
        const where = {
          store: { organizationId: context.organizationId },
          ...(storeId ? { storeId } : {}),
          ...(ratings?.length ? { rating: { in: ratings } } : {}),
          ...(replyStatus ? { replyStatus } : {}),
          ...(riskLevel ? { riskLevel } : {}),
          ...(q ? { OR: [{ text: { contains: q, mode: "insensitive" as const } }, { authorName: { contains: q, mode: "insensitive" as const } }] } : {}),
          ...(from || to ? { postedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
        };

        const [items, total] = await Promise.all([
          prisma.review.findMany({
            where,
            include: {
              store: { select: { id: true, name: true } },
              drafts: { orderBy: { createdAt: "desc" }, take: 1 },
            },
            orderBy: { postedAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          prisma.review.count({ where }),
        ]);

        return { items, total, page, pageSize };
      },
      "query",
    ),
  ),
);
