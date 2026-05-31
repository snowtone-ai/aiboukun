import { prisma } from "@/lib/prisma/client";

export type AuditLogInput = {
  organizationId: string;
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
};

export function logAudit(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      before: input.before ?? undefined,
      after: input.after ?? undefined,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  });
}
