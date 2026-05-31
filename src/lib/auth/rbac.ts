import { ForbiddenError } from "@/lib/api/errors";
import type { ApiContext, ApiHandler } from "@/lib/api/middleware";

export const roleRank = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
} as const;

export type AppRole = keyof typeof roleRank;

export function isRole(value: unknown): value is AppRole {
  return typeof value === "string" && value in roleRank;
}

export function checkPermission(userRole: string | null | undefined, requiredRole: AppRole) {
  return isRole(userRole) && roleRank[userRole] >= roleRank[requiredRole];
}

export function assertPermission(userRole: string | null | undefined, requiredRole: AppRole) {
  if (!checkPermission(userRole, requiredRole)) {
    throw new ForbiddenError(`${requiredRole}以上の権限が必要です`);
  }
}

export function withRole<TParams = Record<string, string>, TResult = unknown>(
  requiredRole: AppRole,
  handler: ApiHandler<ApiContext<TParams> & { session: NonNullable<ApiContext<TParams>["session"]> }, TResult>,
): ApiHandler<ApiContext<TParams> & { session: NonNullable<ApiContext<TParams>["session"]> }, TResult> {
  return (request, context) => {
    assertPermission(context.session.role, requiredRole);
    return handler(request, context);
  };
}
