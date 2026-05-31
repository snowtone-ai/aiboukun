import { describe, expect, it } from "vitest";
import { estimateCostJpy } from "../usage-logger";

describe("estimateCostJpy", () => {
  it("returns null for unknown models", () => {
    expect(estimateCostJpy("unknown", { inputTokens: 100, outputTokens: 50, totalTokens: 150 })).toBeNull();
  });

  it("estimates known Gemini model cost", () => {
    expect(estimateCostJpy("gemini-2.5-flash", { inputTokens: 1_000, outputTokens: 500, totalTokens: 1_500 })).toBeCloseTo(
      0.15,
    );
  });
});
