import { createHmac, randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

/* ============================================================
   Auth — مدیر سایت
   هش رمز: scrypt | نشست: کوکی امضاشده HMAC-SHA256
   (مستقل از الیاس‌ها تا اسکریپت seed هم بتواند استفاده کند)
   ============================================================ */

const SECRET =
  process.env.ADMIN_SECRET || "kermani-omfs-admin-secret-please-set-ADMIN_SECRET";

export const SESSION_COOKIE = "km_admin";
export const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // ۷ روز

/* ---------- رمز عبور ---------- */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `s1:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [v, salt, hash] = stored.split(":");
    if (v !== "s1" || !salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ---------- توکن نشست ---------- */
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(payload: { u: string; exp: number }): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): { u: string } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      u: string;
      exp: number;
    };
    if (!payload?.u || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return { u: payload.u };
  } catch {
    return null;
  }
}

/* ---------- محدودسازی تلاش ورود (در حافظه) ---------- */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function loginAllowed(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  rec.count += 1;
  return rec.count <= 8;
}

export function loginSucceeded(key: string): void {
  attempts.delete(key);
}

/* ---------- شناسه نشست بازدیدکننده (آمار) ---------- */
export function visitorSessionId(ip: string, ua: string): string {
  return createHash("sha1").update(`${ip}|${ua}`).digest("hex").slice(0, 16);
}
