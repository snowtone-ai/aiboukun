import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";
import { storeCreateSchema } from "@/lib/validators/workflows";
import { prisma } from "@/lib/prisma/client";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        const store = await prisma.store.findFirst({
          where: { id: context.input.id, organizationId: context.organizationId },
          include: { brand: true, area: true, gbp: true },
        });
        if (!store) {
          throw new NotFoundError("Store not found");
        }
        return store;
      },
      "params",
    ),
  ),
);

export const PATCH = createRouteHandler(
  withOrg(async (request, context) => {
    const params = routeParamsSchema.parse(context.params);
    const input = storeCreateSchema.partial().parse(await request.json());
    const store = await prisma.store.updateMany({
      where: { id: params.id, organizationId: context.organizationId },
      data: input,
    });
    if (store.count === 0) {
      throw new NotFoundError("Store not found");
    }
    return prisma.store.findUnique({ where: { id: params.id }, include: { gbp: true } });
  }),
);
