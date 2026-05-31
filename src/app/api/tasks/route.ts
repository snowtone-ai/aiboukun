import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { taskCreateSchema, taskListQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      taskListQuerySchema,
      async (_request, context) => {
        const { page, pageSize, storeId, status } = context.input;
        const where = {
          store: { organizationId: context.organizationId },
          ...(storeId ? { storeId } : {}),
          ...(status ? { status } : {}),
        };
        const [items, total] = await Promise.all([
          prisma.task.findMany({
            where,
            include: { store: { select: { id: true, name: true } } },
            orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          prisma.task.count({ where }),
        ]);
        return { items, total, page, pageSize };
      },
      "query",
    ),
  ),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(taskCreateSchema, async (_request, context) => {
      const store = await prisma.store.findFirst({
        where: { id: context.input.storeId, organizationId: context.organizationId },
        select: { id: true },
      });
      if (!store) {
        throw new NotFoundError("Store not found");
      }
      return prisma.task.create({ data: context.input });
    }),
  ),
);
