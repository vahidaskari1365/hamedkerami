"use client";

/* ============================================================
   HtmlLang — تنظیم زبان/جهتِ تگ <html> برای هر گروه زبانی.
   ریشه‌ی سایت (فارسی) با layout اصلی rtl است؛ صفحات /en با
   این کامپوننت سمت کلاینت dir="ltr" می‌گیرند (پایدار در
   ناوبری نرم، بدون درگیری با hydration).
   خودِ محتوای EN هم روی wrapper با dir="ltr" است تا خزنده‌ها
   (که جاوااسکریپت اجرا نمی‌کنند) جهت درست را ببینند.
   ============================================================ */

import { useEffect } from "react";

export function HtmlLang({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    return () => {
      /* برگشت به فارسی هنگام خروج از گروه زبانی — SiteShell هم مقدار می‌دهد */
      document.documentElement.lang = "fa";
      document.documentElement.dir = "rtl";
    };
  }, [lang, dir]);
  return null;
}
