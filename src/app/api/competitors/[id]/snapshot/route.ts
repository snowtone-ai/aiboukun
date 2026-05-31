import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/api/errors";
import { routeParamsSchema } from "@/lib/validators/common";
import { competitorSnapshotSchema } from "@/lib/validators/management";

export const POST = createRouteHandler(
  withOrg(
    withValidation(competitorSnapshotSchema, async (_request, context) => {
      const params = routeParamsSchema.parse(context.params);
      const competitor = await prisma.competitor.findFirst({
        where: { id: params.id, store: { organizationId: context.organizationId } },
        select: { id: true },
      });

      if (!competitor) {
        throw new NotFoundError("Competitor not found");
      }

      return prisma.competitorSnapshot.create({
        data: {
          competitorId: params.id,
          ...context.input,
        },
      });
    }),
  ),
);
