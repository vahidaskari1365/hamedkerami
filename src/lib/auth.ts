import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

/* ============================================================
   Auth — مدیر سایت
   هش رمز: scrypt | نشست: کوکی امضاشده HMAC-SHA256
   (مستقل از الیاس‌ها تا اسکریپت seed هم بتواند استفاده کند)
   ============================================================ */

/* ---------- رمز امضای نشست ----------
   ترتیب: متغیر محیطی ADMIN_SECRET → فایل پایدار db/.admin-secret
   (خارج از مخزن git). هرگز از یک مقدار ثابت کامیت‌شده استفاده نمی‌کنیم
   چون هر کسی که سورس را ببیند می‌تواند کوکی ادمین جعل کند. */
function loadOrCreateSecret(): string {
  const fromEnv = process.env.ADMIN_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;

  try {
    const dir = path.join(process.cwd(), "db");
    const file = path.join(dir, ".admin-secret");
    if (existsSync(file)) {
      const existing = readFileSync(file, "utf8").trim();
      if (existing.length >= 32) return existing;
    }
    const secret = randomBytes(32).toString("hex");
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  } catch {
    /* فایل‌سیستم در دسترس نیست — حداقل یک رمز تصادفی برای این فرایند */
    return randomBytes(32).toString("hex");
  }
}

const SECRET = loadOrCreateSecret();

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

/* هش ساختگی برای برابرکردن زمان پاسخ وقتی کاربر وجود ندارد
   (جلوگیری از شناسایی نام کاربری معتبر با اندازه‌گیری زمان) */
const DUMMY_HASH = `s1:${randomBytes(16).toString("hex")}:${randomBytes(64).toString("hex")}`;
export function dummyVerify(password: string): void {
  try {
    verifyPassword(password, DUMMY_HASH);
  } catch {
    /* بی‌اهمیت */
  }
}

/* ---------- نسخه‌ی رمز (pv) ----------
   اثر انگشت کوتاه hash رمز فعلی؛ داخل توکن نشست ذخیره می‌شود.
   با تغییر رمز، همه‌ی نشست‌های قدیمی بلافاصله باطل می‌شوند. */
export function passwordVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 12);
}

/* ---------- توکن نشست ---------- */
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(payload: { u: string; exp: number; pv: string }): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(
  token: string | undefined | null
): { u: string; pv: string } | null {
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
      pv?: string;
    };
    if (!payload?.u || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    /* توکن‌های قدیمی بدون pv — فقط تا پایان مهاجرت معتبر بمانند */
    return { u: payload.u, pv: typeof payload.pv === "string" ? payload.pv : "" };
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

/* ---------- محدودکننده‌ی عمومی نرخ درخواست (در حافظه) ----------
   پنجره‌ی لغزان ساده برای APIهای عمومی (فرم تماس، آمار بازدید) */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = buckets.get(key) ?? [];
  const fresh = arr.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  /* جلوگیری از رشد بی‌نهایت حافظه */
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }
  return true;
}

/* ---------- شناسه نشست بازدیدکننده (آمار) ---------- */
export function visitorSessionId(ip: string, ua: string): string {
  return createHash("sha1").update(`${ip}|${ua}`).digest("hex").slice(0, 16);
}
