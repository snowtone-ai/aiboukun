const requiredProductionEnv = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "TOKEN_ENCRYPTION_KEY",
  "GEMINI_API_KEY",
] as const;

const requiredProductionEnvGroups = [
  ["AUTH_URL", "NEXTAUTH_URL"],
  ["GOOGLE_CLIENT_ID", "AUTH_GOOGLE_ID"],
  ["GOOGLE_CLIENT_SECRET", "AUTH_GOOGLE_SECRET"],
] as const;

export function validateRuntimeEnv() {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const missing = [
    ...requiredProductionEnv.filter((key) => !process.env[key]),
    ...requiredProductionEnvGroups
      .filter((group) => group.every((key) => !process.env[key]))
      .map((group) => group.join(" or ")),
  ];

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
