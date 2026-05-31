import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/api/errors";
import { routeParamsSchema } from "@/lib/validators/common";
import { competitorUpdateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg(
    withValidation(routeParamsSchema, async (_request, context) => {
      const competitor = await prisma.competitor.findFirst({
        where: { id: context.input.id, store: { organizationId: context.organizationId } },
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 10 }, store: true },
      });

      if (!competitor) {
        throw new NotFoundError("Competitor not found");
      }

      return competitor;
    }, "params"),
  ),
);

export const PATCH = createRouteHandler(
  withOrg(
    withValidation(competitorUpdateSchema, async (request, context) => {
      const params = routeParamsSchema.parse(context.params);
      const existing = await prisma.competitor.findFirst({
        where: { id: params.id, store: { organizationId: context.organizationId } },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundError("Competitor not found");
      }

      return prisma.competitor.update({
        where: { id: params.id },
        data: context.input,
      });
    }),
  ),
);

export const DELETE = createRouteHandler(
  withOrg(
    withValidation(routeParamsSchema, async (_request, context) => {
      const existing = await prisma.competitor.findFirst({
        where: { id: context.input.id, store: { organizationId: context.organizationId } },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundError("Competitor not found");
      }

      await prisma.competitor.delete({ where: { id: context.input.id } });
      return { deleted: true };
    }, "params"),
  ),
);
