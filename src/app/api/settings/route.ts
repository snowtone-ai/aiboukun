import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { assertPermission } from "@/lib/auth/rbac";
import { settingsPatchSchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(async (_request, context) => {
    const [organization, memory] = await Promise.all([
      prisma.organization.findUnique({ where: { id: context.organizationId } }),
      prisma.aIStyleMemory.findFirst({
        where: { organizationId: context.organizationId, scope: "ORG", key: "settings" },
      }),
    ]);
    return { organization, aiSettings: memory?.value ?? {} };
  }),
);

export const PATCH = createRouteHandler(
  withOrg(
    withValidation(settingsPatchSchema, async (_request, context) => {
      assertPermission(context.session!.role, "ADMIN");
      const { organizationName, ...aiSettings } = context.input;
      const organization = organizationName
        ? await prisma.organization.update({ where: { id: context.organizationId }, data: { name: organizationName } })
        : await prisma.organization.findUnique({ where: { id: context.organizationId } });

      const existing = await prisma.aIStyleMemory.findFirst({
        where: { organizationId: context.organizationId, scope: "ORG", key: "settings" },
        select: { id: true },
      });
      const memory = existing
        ? await prisma.aIStyleMemory.update({ where: { id: existing.id }, data: { value: aiSettings } })
        : await prisma.aIStyleMemory.create({
            data: {
              organizationId: context.organizationId!,
              scope: "ORG",
              key: "settings",
              value: aiSettings,
            },
          });

      return { organization, aiSettings: memory.value };
    }),
  ),
);
