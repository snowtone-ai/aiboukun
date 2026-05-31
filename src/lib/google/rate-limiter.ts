const maxRetries = 3;
const baseDelayMs = 1_000;
const maxDelayMs = 60_000;

type Bucket = { nextAllowedAt: number };

const buckets = new Map<string, Bucket>();

export function canCallGoogle(key: string, now = Date.now()) {
  return (buckets.get(key)?.nextAllowedAt ?? 0) <= now;
}

export function registerGoogleBackoff(key: string, retryCount: number, now = Date.now()) {
  const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** retryCount);
  buckets.set(key, { nextAllowedAt: now + delay });
  return delay;
}

export async function withGoogleRetries<T>(operation: (retryCount: number) => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === maxRetries) {
        break;
      }
      await sleep(Math.min(maxDelayMs, baseDelayMs * 2 ** attempt));
    }
  }

  throw lastError;
}

function isRateLimitError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 429;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
