import { describe, expect, it } from "vitest";
import { checkPermission } from "../rbac";

describe("rbac", () => {
  it("allows higher roles to perform lower role actions", () => {
    expect(checkPermission("OWNER", "ADMIN")).toBe(true);
    expect(checkPermission("MANAGER", "STAFF")).toBe(true);
  });

  it("blocks viewer from reply posting role", () => {
    expect(checkPermission("VIEWER", "MANAGER")).toBe(false);
  });
});
