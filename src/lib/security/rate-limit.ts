type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const maxBuckets = 10_000;

export function isRateLimited(key: string, limit = 120, windowMs = 60_000, now = Date.now()) {
  collectExpiredBuckets(now);

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    evictOldestBucketIfNeeded();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

function collectExpiredBuckets(now: number) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function evictOldestBucketIfNeeded() {
  if (buckets.size < maxBuckets) {
    return;
  }

  const oldestKey = buckets.keys().next().value;
  if (typeof oldestKey === "string") {
    buckets.delete(oldestKey);
  }
}
