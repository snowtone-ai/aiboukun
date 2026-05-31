import type { NextRequest } from "next/server";
import type { z } from "zod";
import { ForbiddenError, UnauthorizedError, ValidationError } from "./errors";
import { errorResponse, ok } from "./response";

export type AuthSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
  organizationId?: string | null;
  role?: string | null;
};

export type ApiContext<TParams = Record<string, string>> = {
  params: TParams;
  session?: AuthSession;
  organizationId?: string;
  input?: unknown;
};

export type ApiHandler<TContext extends ApiContext<unknown> = ApiContext, TResult = unknown> = (
  request: NextRequest,
  context: TContext,
) => Promise<Response | TResult> | Response | TResult;

export type RouteContext<TParams = Record<string, string>> = {
  params?: TParams | Promise<TParams>;
};

type SessionResolver = (request: NextRequest) => Promise<AuthSession | null>;

let resolveAuthSession: SessionResolver = async () => null;

export function setAuthSessionResolver(resolver: SessionResolver) {
  resolveAuthSession = resolver;
}

export function createRouteHandler<TParams = Record<string, string>, TResult = unknown>(
  handler: ApiHandler<ApiContext<TParams>, TResult>,
) {
  return async (request: NextRequest, routeContext: RouteContext<TParams> = {}) => {
    try {
      const params = routeContext.params ? await routeContext.params : ({} as TParams);
      const result = await handler(request, { params });
      return toResponse(result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function withAuth<TParams = Record<string, string>, TResult = unknown>(
  handler: ApiHandler<ApiContext<TParams> & { session: AuthSession }, TResult>,
): ApiHandler<ApiContext<TParams>, TResult | Response> {
  return async (request, context) => {
    const session = await resolveAuthSession(request);

    if (!session?.user.id) {
      throw new UnauthorizedError();
    }

    return handler(request, { ...context, session });
  };
}

export function withOrg<TParams = Record<string, string>, TResult = unknown>(
  handler: ApiHandler<ApiContext<TParams> & { session: AuthSession; organizationId: string }, TResult>,
): ApiHandler<ApiContext<TParams>, TResult | Response> {
  return withAuth(async (request, context) => {
    const organizationId = context.session.organizationId;

    if (!organizationId) {
      throw new ForbiddenError("Organization membership required");
    }

    return handler(request, { ...context, organizationId });
  });
}

export function withValidation<TSchema extends z.ZodType, TParams = Record<string, string>, TResult = unknown>(
  schema: TSchema,
  handler: ApiHandler<ApiContext<TParams> & { input: z.output<TSchema> }, TResult>,
  source: "json" | "query" | "params" = "json",
): ApiHandler<ApiContext<TParams>, TResult | Response> {
  return async (request, context) => {
    const input = await readInput(request, context, source);
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError("Invalid request", parsed.error.issues);
    }

    return handler(request, { ...context, input: parsed.data });
  };
}

async function readInput<TParams>(
  request: NextRequest,
  context: ApiContext<TParams>,
  source: "json" | "query" | "params",
) {
  if (source === "query") {
    return Object.fromEntries(request.nextUrl.searchParams.entries());
  }

  if (source === "params") {
    return context.params;
  }

  if (!request.body) {
    return {};
  }

  return request.json();
}

function toResponse<TResult>(result: Response | TResult) {
  if (result instanceof Response) {
    return result;
  }

  return ok(result);
}
