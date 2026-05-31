import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/api/errors";
import { areaCreateSchema } from "@/lib/validators/management";

export const GET = createRouteHandler(
  withOrg((_request, context) => {
    return prisma.area.findMany({
      where: { brand: { organizationId: context.organizationId } },
      include: { brand: true, stores: true },
      orderBy: { name: "asc" },
    });
  }),
);

export const POST = createRouteHandler(
  withOrg(
    withValidation(areaCreateSchema, async (_request, context) => {
      const brand = await prisma.brand.findFirst({
        where: { id: context.input.brandId, organizationId: context.organizationId },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundError("Brand not found");
      }

      return prisma.area.create({ data: context.input });
    }),
  ),
);
