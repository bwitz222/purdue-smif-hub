import { afterEach, describe, expect, it } from "vitest";
import { isAuthorizedHook } from "@/lib/hook-auth.server";

const req = (secret?: string) =>
  new Request("https://example.test/api/public/hooks/refresh-quotes", {
    method: "POST",
    headers: secret === undefined ? {} : { "x-refresh-secret": secret },
  });

describe("cron hook authorization", () => {
  const saved = process.env.REFRESH_HOOK_SECRET;
  afterEach(() => {
    if (saved === undefined) delete process.env.REFRESH_HOOK_SECRET;
    else process.env.REFRESH_HOOK_SECRET = saved;
  });

  it("accepts the exact secret", () => {
    process.env.REFRESH_HOOK_SECRET = "s3cret-value";
    expect(isAuthorizedHook(req("s3cret-value"))).toBe(true);
  });

  it("rejects a wrong, partial, longer or missing secret", () => {
    process.env.REFRESH_HOOK_SECRET = "s3cret-value";
    for (const v of ["nope", "s3cret-valu", "s3cret-value-and-more", "", undefined]) {
      expect(isAuthorizedHook(req(v)), String(v)).toBe(false);
    }
  });

  it("fails closed when no secret is configured", () => {
    delete process.env.REFRESH_HOOK_SECRET;
    expect(isAuthorizedHook(req(""))).toBe(false);
    expect(isAuthorizedHook(req("anything"))).toBe(false);
  });
});
