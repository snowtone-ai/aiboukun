import { describe, expect, it } from "vitest";
import { applyReplySafety } from "../review-reply-agent";

describe("applyReplySafety", () => {
  it("forces approval for rating 2 replies", () => {
    const result = applyReplySafety(
      { rating: 2, reviewText: "残念でした" },
      { reply: "ご意見ありがとうございます。", requiresApproval: false, riskNotes: [], tone: "warm" },
    );

    expect(result.requiresApproval).toBe(true);
  });

  it("adds approval when generated reply contains NG words", () => {
    const result = applyReplySafety(
      { rating: 5, reviewText: "良かった", ngWords: ["絶対"] },
      { reply: "絶対にまた満足いただけます。", requiresApproval: false, riskNotes: [], tone: "polite" },
    );

    expect(result.requiresApproval).toBe(true);
    expect(result.riskNotes).toContain("NG word: 絶対");
  });
});
