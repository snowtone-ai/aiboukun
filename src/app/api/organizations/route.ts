import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { organizationUpdateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg((_request, context) => {
    return prisma.organization.findUniqueOrThrow({
      where: { id: context.organizationId },
      include: { brands: true, stores: true, members: true },
    });
  }),
);

export const PATCH = createRouteHandler(
  withOrg(
    withValidation(organizationUpdateSchema, (_request, context) => {
      return prisma.organization.update({
        where: { id: context.organizationId },
        data: context.input,
      });
    }),
  ),
);
