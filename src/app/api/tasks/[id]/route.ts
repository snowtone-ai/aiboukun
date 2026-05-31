import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";
import { taskPatchSchema } from "@/lib/validators/workflows";

export const PATCH = createRouteHandler(
  withOrg(
    withValidation(taskPatchSchema, async (_request, context) => {
      const params = routeParamsSchema.parse(context.params);
      const task = await prisma.task.findFirst({
        where: { id: params.id, store: { organizationId: context.organizationId } },
        select: { id: true },
      });
      if (!task) {
        throw new NotFoundError("Task not found");
      }
      return prisma.task.update({ where: { id: params.id }, data: context.input });
    }),
  ),
);

export const DELETE = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        const task = await prisma.task.findFirst({
          where: { id: context.input.id, store: { organizationId: context.organizationId } },
          select: { id: true },
        });
        if (!task) {
          throw new NotFoundError("Task not found");
        }
        await prisma.task.delete({ where: { id: context.input.id } });
        return { deleted: true };
      },
      "params",
    ),
  ),
);
