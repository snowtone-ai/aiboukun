import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { GoogleBusinessProfileClient } from "@/lib/google/gbp-client";
import { prisma } from "@/lib/prisma/client";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    assertPermission(context.session.role, "MANAGER");

    const connection = await prisma.googleConnection.findFirst({
      where: { organizationId: context.organizationId },
      orderBy: { updatedAt: "desc" },
    });

    if (!connection) {
      throw new NotFoundError("Google connection not found");
    }

    const client = new GoogleBusinessProfileClient({
      organizationId: context.organizationId,
      accessTokenEnc: connection.accessTokenEnc,
    });

    return client.listAccounts();
  }),
);
