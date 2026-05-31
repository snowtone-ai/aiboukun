import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { auditLogQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      auditLogQuerySchema,
      async (_request, context) => {
        assertPermission(context.session!.role, "ADMIN");

        const rows = await prisma.auditLog.findMany({
          where: { organizationId: context.organizationId! },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          cursor: context.input.cursor ? { id: context.input.cursor } : undefined,
          skip: context.input.cursor ? 1 : 0,
          take: context.input.limit + 1,
        });
        const hasNextPage = rows.length > context.input.limit;
        const items = hasNextPage ? rows.slice(0, context.input.limit) : rows;

        return {
          items,
          nextCursor: hasNextPage ? items.at(-1)?.id : null,
        };
      },
      "query",
    ),
  ),
);
