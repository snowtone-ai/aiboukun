import { ZodError } from "zod";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "GONE"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly statusCode: number;
  readonly errorCode: ErrorCode | string;
  readonly details?: unknown;

  constructor(statusCode: number, errorCode: ErrorCode | string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Permission denied") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}

export class GoneError extends AppError {
  constructor(message = "Resource is no longer available") {
    super(410, "GONE", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request", details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError("Invalid request", error.issues);
  }

  if (error instanceof SyntaxError) {
    return new AppError(400, "BAD_REQUEST", "Malformed request body");
  }

  return new AppError(500, "INTERNAL_SERVER_ERROR", "Unexpected server error");
}
