import { describe, expect, it } from "vitest";
import { classifyByRules } from "../risk-detection-agent";

describe("classifyByRules", () => {
  it("requires approval for low-rating reviews", () => {
    expect(classifyByRules({ rating: 1, text: "対応が悪かった" })).toMatchObject({
      level: "ATTENTION",
      requiresApproval: true,
      autoReplyAllowed: false,
    });
  });

  it("escalates refund or accident wording", () => {
    expect(classifyByRules({ rating: 2, text: "返金してほしい。事故のような対応でした" })).toMatchObject({
      level: "URGENT",
      requiresApproval: true,
    });
  });

  it("blocks automatic replies for privacy wording", () => {
    expect(classifyByRules({ rating: 5, text: "個人情報が見えていました" })).toMatchObject({
      level: "PRIVACY",
      autoReplyAllowed: false,
    });
  });
});
