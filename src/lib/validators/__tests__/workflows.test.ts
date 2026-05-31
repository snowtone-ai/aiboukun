import { describe, expect, it } from "vitest";
import { googleCallbackSchema, reviewListQuerySchema, settingsPatchSchema } from "../workflows";

describe("workflow validators", () => {
  it("parses comma separated review ratings", () => {
    const parsed = reviewListQuerySchema.parse({ ratings: "1,2,5", page: "1" });
    expect(parsed.ratings).toEqual([1, 2, 5]);
  });

  it("rejects invalid setting tone", () => {
    expect(() => settingsPatchSchema.parse({ replyTone: "casual" })).toThrow();
  });

  it("accepts encrypted-token callback payload shape before encryption", () => {
    const parsed = googleCallbackSchema.parse({
      accessToken: "access",
      refreshToken: "refresh",
      scopes: "openid,https://www.googleapis.com/auth/business.manage",
    });
    expect(parsed.scopes).toContain("https://www.googleapis.com/auth/business.manage");
  });
});
