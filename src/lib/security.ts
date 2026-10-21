import { createHash, createHmac } from "node:crypto";
import { db } from "@/lib/db";

const WINDOW_MS = 10 * 60 * 1000;

export async function consumeRateLimit(key: string, limit: number): Promise<boolean> {
  const now = new Date();
  const nextReset = new Date(now.getTime() + WINDOW_MS);
  const count = await db.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      INSERT INTO \`ratelimitcounter\` (\`key\`, \`count\`, \`resetAt\`, \`updatedAt\`)
      VALUES (${key}, 1, ${nextReset}, ${now})
      ON DUPLICATE KEY UPDATE
        \`count\` = IF(\`resetAt\` <= ${now}, 1, \`count\` + 1),
        \`resetAt\` = IF(\`resetAt\` <= ${now}, ${nextReset}, \`resetAt\`),
        \`updatedAt\` = ${now}
    `;
    const counter = await transaction.rateLimitCounter.findUnique({ where: { key } });
    if (!counter) throw new Error("Rate limit counter was not persisted.");
    return counter.count;
  });
  return count <= limit;
}

export function requestFingerprint(request: Request): string {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  const secret = process.env.AUTH_SECRET ?? "local-development-only";
  return createHmac("sha256", secret).update(address).digest("hex").slice(0, 32);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
