import { createRouteHandler, withOrg } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    const organizationId = context.organizationId;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);

    const [storeCount, lowRatingCount, unrepliedCount, openTaskCount, unreadNotificationCount, recentReviews] =
      await Promise.all([
        prisma.store.count({ where: { organizationId } }),
        prisma.review.count({
          where: { store: { organizationId }, rating: { lte: 3 }, postedAt: { gte: since } },
        }),
        prisma.review.count({
          where: { store: { organizationId }, replyStatus: "UNREPLIED" },
        }),
        prisma.task.count({
          where: { store: { organizationId }, status: { in: ["TODO", "DOING"] } },
        }),
        prisma.notification.count({
          where: { organizationId, status: "UNREAD" },
        }),
        prisma.review.findMany({
          where: { store: { organizationId } },
          orderBy: { postedAt: "desc" },
          take: 5,
          select: {
            id: true,
            rating: true,
            authorName: true,
            text: true,
            postedAt: true,
            replyStatus: true,
            riskLevel: true,
            store: { select: { id: true, name: true } },
          },
        }),
      ]);

    return {
      storeCount,
      lowRatingCount,
      unrepliedCount,
      openTaskCount,
      unreadNotificationCount,
      recentReviews,
    };
  }),
);
