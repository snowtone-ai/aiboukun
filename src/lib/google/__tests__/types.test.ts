import { describe, expect, it } from "vitest";
import { googleRatingToNumber } from "../types";

describe("google types", () => {
  it("maps Google star labels to numbers", () => {
    expect(googleRatingToNumber("ONE")).toBe(1);
    expect(googleRatingToNumber("FIVE")).toBe(5);
    expect(googleRatingToNumber(undefined)).toBe(0);
  });
});
