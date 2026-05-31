import { createRouteHandler, withOrg } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    const stores = await prisma.store.findMany({
      where: { organizationId: context.organizationId },
      select: {
        id: true,
        name: true,
        nextSyncAt: true,
        gbp: { select: { googleLocationName: true, verified: true } },
      },
      orderBy: { name: "asc" },
    });

    const latestCalls = await prisma.googleApiCallLog.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { stores, latestCalls };
  }),
);
