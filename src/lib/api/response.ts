import { NextResponse } from "next/server";
import type { ApiError, ApiResponse } from "@/types/domain";
import { normalizeError } from "./errors";

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: ApiError, status = 500, init?: ResponseInit): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ ok: false, error }, { ...init, status });
}

export function errorResponse(error: unknown): NextResponse<ApiResponse<never>> {
  const appError = normalizeError(error);

  if (appError.statusCode >= 500) {
    console.error("[API Error]", error);
  }

  return fail(
    {
      code: appError.errorCode,
      message: appError.message,
      details: publicErrorDetails(appError.details),
    },
    appError.statusCode,
  );
}

function publicErrorDetails(details: unknown) {
  if (process.env.NODE_ENV !== "production") {
    return details;
  }

  if (!Array.isArray(details)) {
    return undefined;
  }

  const fields = details
    .map((detail) => {
      if (!detail || typeof detail !== "object" || !("path" in detail)) {
        return null;
      }
      const path = (detail as { path?: unknown }).path;
      return Array.isArray(path) ? path.join(".") : null;
    })
    .filter((field): field is string => Boolean(field));

  return fields.length > 0 ? { fields: Array.from(new Set(fields)) } : undefined;
}
