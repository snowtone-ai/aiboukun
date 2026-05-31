import { afterEach, describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "../token-encryption";

const validKey = "a".repeat(64);
const otherKey = "b".repeat(64);
const originalKey = process.env.TOKEN_ENCRYPTION_KEY;

afterEach(() => {
  process.env.TOKEN_ENCRYPTION_KEY = originalKey;
});

describe("token encryption", () => {
  it("decrypts encrypted tokens back to the original value", () => {
    process.env.TOKEN_ENCRYPTION_KEY = validKey;

    const encrypted = encryptToken("refresh-token-value");

    expect(encrypted).not.toBe("refresh-token-value");
    expect(decryptToken(encrypted)).toBe("refresh-token-value");
  });

  it("uses a random iv for each encrypted token", () => {
    process.env.TOKEN_ENCRYPTION_KEY = validKey;

    expect(encryptToken("same-token")).not.toBe(encryptToken("same-token"));
  });

  it("fails when decrypting with a different key", () => {
    process.env.TOKEN_ENCRYPTION_KEY = validKey;
    const encrypted = encryptToken("refresh-token-value");

    process.env.TOKEN_ENCRYPTION_KEY = otherKey;

    expect(() => decryptToken(encrypted)).toThrow();
  });

  it("rejects invalid encryption keys", () => {
    process.env.TOKEN_ENCRYPTION_KEY = "short";

    expect(() => encryptToken("refresh-token-value")).toThrow("64-character hex");
  });
});
