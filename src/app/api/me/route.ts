import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withAuth } from "@/lib/api/middleware";

export const GET = createRouteHandler(
  withAuth(async (_request, context) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: context.session.user.id },
      include: { memberships: { include: { organization: true } } },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      memberships: user.memberships,
      activeOrganizationId: context.session.organizationId,
    };
  }),
);
