type RateLimitResult = { success: boolean; remaining: number };

const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function upstashRateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", windowKey],
        ["EXPIRE", windowKey, windowSec.toString()],
      ]),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { result: [number, unknown][] };
    const count = data.result?.[0]?.[1] as number;
    return { success: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return null;
  }
}

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { success: false, remaining: 0 };
  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

export async function checkRateLimit(
  key: string,
  limit = 5,
  windowSec = 60
): Promise<RateLimitResult> {
  const upstash = await upstashRateLimit(key, limit, windowSec);
  if (upstash) return upstash;

  if (process.env.NODE_ENV === "production" && !process.env.UPSTASH_REDIS_REST_URL) {
    console.warn("[rate-limit] UPSTASH_REDIS_REST_URL not set — using in-memory fallback (not safe for multi-instance production)");
  }

  return memoryRateLimit(key, limit, windowSec * 1000);
}
