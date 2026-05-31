import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { brandCreateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg((_request, context) => {
    return prisma.brand.findMany({
      where: { organizationId: context.organizationId },
      include: { areas: true, stores: true },
      orderBy: { name: "asc" },
    });
  }),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(brandCreateSchema, (_request, context) => {
      const organizationId = context.organizationId!;

      return prisma.brand.create({
        data: {
          organization: { connect: { id: organizationId } },
          name: context.input.name,
        },
      });
    }),
  ),
);
