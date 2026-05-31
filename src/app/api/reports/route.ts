import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { reportListQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      reportListQuerySchema,
      async (_request, context) => {
        const { page, pageSize, storeId, type } = context.input;
        const where = {
          organizationId: context.organizationId,
          ...(storeId ? { storeId } : {}),
          ...(type ? { type } : {}),
        };
        const [items, total] = await Promise.all([
          prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          prisma.report.count({ where }),
        ]);
        return { items, total, page, pageSize };
      },
      "query",
    ),
  ),
);
