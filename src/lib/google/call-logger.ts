import { prisma } from "@/lib/prisma/client";

export type GoogleCallLogInput = {
  organizationId?: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  errorCode?: string;
  retryCount?: number;
};

export function logGoogleApiCall(input: GoogleCallLogInput) {
  return prisma.googleApiCallLog.create({
    data: {
      organizationId: input.organizationId,
      endpoint: input.endpoint,
      method: input.method,
      statusCode: input.statusCode,
      errorCode: input.errorCode,
      retryCount: input.retryCount ?? 0,
    },
  });
}
