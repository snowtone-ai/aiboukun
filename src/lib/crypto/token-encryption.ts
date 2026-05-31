import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const encoding = "hex";
const ivLength = 12;
const keyHexLength = 64;

function getEncryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;

  if (!key || key.length !== keyHexLength || !/^[0-9a-f]+$/i.test(key)) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string.");
  }

  return Buffer.from(key, encoding);
}

export function encryptToken(plaintext: string) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString(encoding), authTag.toString(encoding), ciphertext.toString(encoding)].join(":");
}

export function decryptToken(encrypted: string) {
  const [ivHex, authTagHex, ciphertextHex] = encrypted.split(":");

  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Encrypted token format is invalid.");
  }

  const decipher = createDecipheriv(algorithm, getEncryptionKey(), Buffer.from(ivHex, encoding));
  decipher.setAuthTag(Buffer.from(authTagHex, encoding));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, encoding)),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
