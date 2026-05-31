import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        const report = await prisma.report.findFirst({
          where: { id: context.input.id, organizationId: context.organizationId },
        });
        if (!report) {
          throw new NotFoundError("Report not found");
        }
        return report;
      },
      "params",
    ),
  ),
);
