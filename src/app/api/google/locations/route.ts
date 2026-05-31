import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { GoogleBusinessProfileClient } from "@/lib/google/gbp-client";
import { prisma } from "@/lib/prisma/client";
import { googleLocationsQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      googleLocationsQuerySchema,
      async (_request, context) => {
        assertPermission(context.session!.role, "MANAGER");

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
        const accountName = context.input.accountName ?? (await client.listAccounts()).items[0]?.name;

        if (!accountName) {
          return { items: [] };
        }

        return client.listLocations(accountName);
      },
      "query",
    ),
  ),
);
