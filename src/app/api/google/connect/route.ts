import { NextResponse } from "next/server";
import { createRouteHandler, withOrg } from "@/lib/api/middleware";

export const GET = createRouteHandler(
  withOrg((request) => {
    const signInUrl = new URL("/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", "/app/settings");

    return NextResponse.redirect(signInUrl);
  }),
);
