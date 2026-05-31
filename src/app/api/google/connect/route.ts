import { NextResponse } from "next/server";
import { createRouteHandler, withOrg } from "@/lib/api/middleware";

export const GET = createRouteHandler(
  withOrg((request) => {
    const params = new URLSearchParams({
      callbackUrl: "/app/settings",
      scope: "openid email profile https://www.googleapis.com/auth/business.manage",
    });

    const signInUrl = new URL(`/api/auth/signin/google?${params.toString()}`, request.nextUrl.origin);

    return NextResponse.redirect(signInUrl);
  }),
);
