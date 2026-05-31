import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        const review = await prisma.review.findFirst({
          where: { id: context.input.id, store: { organizationId: context.organizationId } },
          include: {
            store: true,
            drafts: { orderBy: { createdAt: "desc" }, take: 5 },
            replies: { orderBy: { postedAt: "desc" }, take: 3 },
            riskFlags: { orderBy: { createdAt: "desc" }, take: 5 },
          },
        });

        if (!review) {
          throw new NotFoundError("Review not found");
        }

        return review;
      },
      "params",
    ),
  ),
);
