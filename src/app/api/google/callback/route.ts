import { GoneError } from "@/lib/api/errors";
import { createRouteHandler, withOrg } from "@/lib/api/middleware";

export const POST = createRouteHandler(
  withOrg(
    async () => {
      throw new GoneError("Google OAuth tokens are accepted only through the server-side Auth.js callback");
    },
  ),
);
