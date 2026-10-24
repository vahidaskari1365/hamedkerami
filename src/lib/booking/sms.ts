/* ============================================================
   سرویس پیامک — لایه انتزاعی پنل SMS
   تا زمان خرید پنل، حالت «console» فعال است: کد در لاگ سرور
   ثبت می‌شود و برای تست در پاسخ API هم برگردانده می‌شود (devCode).
   بعداً فقط env ها را ست کنید — بدون تغییر کد:
     SMS_PROVIDER=kavenegar  KAVENEGAR_API_KEY=…  SMS_SENDER=…
     SMS_PROVIDER=smsir      SMSIR_API_KEY=…       SMSIR_LINE=…
   ============================================================ */

export type SmsProviderName = "console" | "kavenegar" | "smsir";

export interface SmsResult {
  ok: boolean;
  provider: SmsProviderName;
  id?: string;
  error?: string;
}

export interface SmsProvider {
  name: SmsProviderName;
  send(to: string, text: string): Promise<SmsResult>;
}

/* ---------- حالت تست — بدون پنل SMS ---------- */
const consoleProvider: SmsProvider = {
  name: "console",
  async send(to, text) {
    console.log(`[sms:console] → ${to} :: ${text}`);
    return { ok: true, provider: "console", id: "console" };
  },
};

/* ---------- کاوه‌نگار ---------- */
const kavenegarProvider: SmsProvider = {
  name: "kavenegar",
  async send(to, text) {
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return { ok: false, provider: "kavenegar", error: "KAVENEGAR_API_KEY تنظیم نشده" };
    try {
      const sender = process.env.SMS_SENDER ?? "";
      const url =
        `https://api.kavenegar.com/v1/${encodeURIComponent(key)}/sms/send.json` +
        `?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(text)}` +
        (sender ? `&sender=${encodeURIComponent(sender)}` : "");
      const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(10_000) });
      const data = (await res.json()) as { return?: { status?: number; message?: string }; entries?: { messageid?: number }[] };
      if (res.ok && data.return?.status === 200) {
        return { ok: true, provider: "kavenegar", id: String(data.entries?.[0]?.messageid ?? "") };
      }
      return { ok: false, provider: "kavenegar", error: data.return?.message ?? `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, provider: "kavenegar", error: (e as Error).message };
    }
  },
};

/* ---------- SMS.ir (ملی پیامک) ---------- */
const smsIrProvider: SmsProvider = {
  name: "smsir",
  async send(to, text) {
    const key = process.env.SMSIR_API_KEY;
    const line = process.env.SMSIR_LINE;
    if (!key || !line) return { ok: false, provider: "smsir", error: "SMSIR_API_KEY یا SMSIR_LINE تنظیم نشده" };
    try {
      const res = await fetch("https://api.sms.ir/v1/send/bulk", {
        method: "POST",
        headers: { "x-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ lineNumber: line, messageText: text, mobiles: [to] }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = (await res.json()) as { status?: number; data?: unknown; message?: string };
      if (res.ok && data.status === 1) {
        return { ok: true, provider: "smsir", id: String(data.data ?? "") };
      }
      return { ok: false, provider: "smsir", error: data.message ?? `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, provider: "smsir", error: (e as Error).message };
    }
  },
};

/** پروایدر فعال — بر اساس env؛ پیش‌فرض console (حالت تست) */
export function getSmsProvider(): SmsProvider {
  switch (process.env.SMS_PROVIDER) {
    case "kavenegar":
      return kavenegarProvider;
    case "smsir":
      return smsIrProvider;
    default:
      return consoleProvider;
  }
}

/** آیا پنل SMS واقعی وصل است؟ (برای تصمیم نمایش devCode و صف پیام‌ها) */
export function smsConnected(): boolean {
  return process.env.SMS_PROVIDER === "kavenegar" || process.env.SMS_PROVIDER === "smsir";
}

/* ---------- نرمال‌سازی شماره موبایل ایران ----------
   ارقام فارسی/عربی، جداکننده‌ها و +۹۸/۰۰۹۸/۹۸ → «09xxxxxxxxx» */
export function normalizeMobile(raw: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  let s = raw
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)))
    .replace(/[\s()._\-]/g, "");
  if (s.startsWith("+98")) s = `0${s.slice(3)}`;
  else if (s.startsWith("0098")) s = `0${s.slice(4)}`;
  else if (s.startsWith("98") && s.length === 12) s = `0${s.slice(2)}`;
  return s;
}

export function isIranMobile(s: string): boolean {
  return /^09\d{9}$/.test(s);
}
