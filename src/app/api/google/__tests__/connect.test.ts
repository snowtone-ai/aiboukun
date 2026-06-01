import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { setAuthSessionResolver } from "@/lib/api/middleware";
import { GET } from "../connect/route";

describe("GET /api/google/connect", () => {
  it("redirects authenticated organization members to Google signin", async () => {
    setAuthSessionResolver(async () => ({
      user: { id: "user_1", email: "owner@example.com" },
      organizationId: "org_1",
      role: "OWNER",
    }));

    const response = await GET(new NextRequest("http://localhost/api/google/connect"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/signin?callbackUrl=%2Fapp%2Fsettings");
  });
});
