import { prisma } from "@/lib/prisma/client";

export type CreateNotificationInput = {
  organizationId: string;
  userId?: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
};

export function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    },
  });
}

export function listNotifications(organizationId: string, userId?: string) {
  return prisma.notification.findMany({
    where: {
      organizationId,
      OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export function markNotificationRead(id: string, organizationId: string) {
  return prisma.notification.updateMany({
    where: { id, organizationId },
    data: { status: "READ" },
  });
}
