import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Gate for the cron webhooks under /api/public/hooks. The caller (pg_cron) sends
 * REFRESH_HOOK_SECRET in the `x-refresh-secret` header.
 *
 * Both values are hashed before comparing so the comparison takes the same time
 * whatever the caller sent: `a !== b` on the raw strings returns at the first
 * differing character, which leaks the secret one character at a time to anyone
 * who can time enough requests. Fails closed when the secret is not configured.
 */
export function isAuthorizedHook(request: Request): boolean {
  const expected = process.env.REFRESH_HOOK_SECRET?.trim();
  const provided = request.headers.get("x-refresh-secret")?.trim();
  if (!expected || !provided) return false;
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(expected), digest(provided));
}
