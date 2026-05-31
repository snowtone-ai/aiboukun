import { describe, expect, it } from "vitest";
import { riskDetectionOutputSchema } from "../risk-detection";
import { reviewReplyOutputSchema } from "../review-reply";

describe("prompt output schemas", () => {
  it("accepts safe risk detection output", () => {
    expect(
      riskDetectionOutputSchema.parse({
        level: "NORMAL",
        reasons: ["通常の口コミです"],
        requiresApproval: false,
        autoReplyAllowed: true,
        recommendedAction: "返信案を作成する",
        confidence: 0.8,
      }),
    ).toMatchObject({ level: "NORMAL" });
  });

  it("requires approval metadata for review replies", () => {
    expect(
      reviewReplyOutputSchema.parse({
        reply: "ご来店ありがとうございました。",
        requiresApproval: true,
        riskNotes: [],
        tone: "warm",
      }),
    ).toMatchObject({ requiresApproval: true });
  });
});
