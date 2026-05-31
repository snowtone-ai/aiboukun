import { describe, expect, it } from "vitest";
import { parseByRules } from "../navigation-agent";

describe("parseByRules", () => {
  it("detects low-rating review filters", () => {
    expect(parseByRules("新宿店の悪い口コミだけ見せて")).toEqual({
      intent: "filter_reviews",
      ratings: [1, 2, 3],
    });
  });

  it("detects report requests", () => {
    expect(parseByRules("今月のレポートを作って")).toMatchObject({
      intent: "generate_report",
    });
  });
});
