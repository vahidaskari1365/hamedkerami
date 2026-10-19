"use client";

/* ============================================================
   پیل نصب PWA — مینیمال و غیرمزاحم (نسخه جدید پس از حذف کارت)
   - فقط در مرورگر (نه حالت نصب‌شده) و فقط موبایل/تبلت نمایش دارد
   - اندروید: پرامپت بومی Chrome (beforeinstallprompt)
   - iOS: شیت کوچک راهنمای «اشتراک → افزودن به صفحه اصلی»
   - بستن: ۳۰ روز دیگر نمایش داده نمی شود
   ============================================================ */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __pwaInstallPrompt?: InstallPromptEvent | null;
  }
}

const DISMISS_KEY = "pwa-pill-until";
const SHOW_DELAY_MS = 2600;

export function PwaInstallPill() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    /* نصب‌شده؟ (standalone) — هیچ چیزی نشان نده */
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (standalone) return;
    } catch {
      /* noop */
    }

    /* بسته‌شده اخیراً؟ */
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      if (Date.now() < until) return;
    } catch {
      /* noop */
    }

    const t = setTimeout(() => setReady(true), SHOW_DELAY_MS);

    const onInstallable = () => setCanPrompt(true);
    window.addEventListener("pwa-installable", onInstallable);

    return () => {
      clearTimeout(t);
      window.removeEventListener("pwa-installable", onInstallable);
    };
  }, [isAdmin]);

  if (isAdmin || !ready) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && "ontouchend" in document));

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } catch {
      /* noop */
    }
    setReady(false);
  };

  const install = async () => {
    if (isIOS) {
      setSheetOpen(true);
      return;
    }
    const ev = window.__pwaInstallPrompt;
    if (ev) {
      try {
        await ev.prompt();
        const { outcome } = await ev.userChoice;
        if (outcome === "accepted") {
          setReady(false);
          return;
        }
      } catch {
        /* noop */
      }
    }
    /* پرامپت بومی آماده نیست — همان راهنمای عمومی را باز کن */
    setSheetOpen(true);
  };

  return (
    <>
      {/* پیل شیشه‌ای پایین صفحه — فقط موبایل/تبلت (جای‌گذاری کامل در CSS سفارشی) */}
      <div
        role="region"
        aria-label="نصب وب‌اپلیکیشن"
        className={`pwa-pill fixed z-[80] w-[calc(100%-2.5rem)] max-w-sm lg:hidden ${
          ready ? "pwa-pill-in" : ""
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-ink/92 p-2.5 pl-3 text-white shadow-2xl shadow-ink/40 ring-1 ring-teal/35 backdrop-blur-xl">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal/15 ring-1 ring-teal/40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9cf87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </span>
          <button
            type="button"
            onClick={install}
            className="flex-1 text-right"
            aria-label="نصب وب‌اپلیکیشن دکتر کرمانی روی گوشی"
          >
            <span className="block text-[13px] font-black leading-5">نصب روی گوشی</span>
            <span className="block text-[10px] leading-4 text-white/60">
              دسترسی سریع مثل اپلیکیشن — آفلاین هم کار می کند
            </span>
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="بستن پیام نصب"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* شیت راهنما — iOS و مرورگرهای بدون پرامپت بومی */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="راهنمای نصب روی گوشی"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="pwa-sheet w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-ink/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden />
            <h2 className="text-center text-base font-black">نصب روی صفحه اصلی گوشی</h2>
            <p className="mt-1.5 text-center text-[11px] leading-5 text-foreground/55">
              کمتر از ۱۰ ثانیه — بدون فروشگاه اپلیکیشن
            </p>

            {isIOS ? (
              <ol className="mt-5 space-y-3.5">
                <li className="flex items-start gap-3 rounded-2xl bg-bone/70 p-3.5 ring-1 ring-ink/6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal-3 ring-1 ring-teal/30" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4" />
                      <path d="m8 8 4-4 4 4" />
                      <path d="M4 20h16" />
                    </svg>
                  </span>
                  <p className="text-[13px] font-semibold leading-6">
                    دکمه <span className="inline-block rounded-md bg-ink px-2 py-0.5 text-[11px] font-black text-white">اشتراک‌گذاری ⬆︎</span> را در پایین سافاری بزنید
                  </p>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-bone/70 p-3.5 ring-1 ring-ink/6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal-3 ring-1 ring-teal/30" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="7" y="3" width="10" height="18" rx="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </span>
                  <p className="text-[13px] font-semibold leading-6">
                    گزینه <span className="rounded-md bg-teal px-2 py-0.5 text-[11px] font-black text-ink">افزودن به صفحه اصلی +</span> را انتخاب کنید
                  </p>
                </li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3.5">
                <li className="flex items-start gap-3 rounded-2xl bg-bone/70 p-3.5 ring-1 ring-ink/6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal-3 ring-1 ring-teal/30" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="12" cy="5" r="1.6" />
                      <circle cx="12" cy="19" r="1.6" />
                    </svg>
                  </span>
                  <p className="text-[13px] font-semibold leading-6">
                    در منوی سه‌نقطه مرورگر، گزینه <b>«نصب برنامه» / «Add to Home screen»</b> را بزنید
                  </p>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-bone/70 p-3.5 ring-1 ring-ink/6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal-3 ring-1 ring-teal/30" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <p className="text-[13px] font-semibold leading-6">تأیید کنید — آیکن سایت کنار اپ های شما قرار می گیرد</p>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => {
                setSheetOpen(false);
                dismiss();
              }}
              className="mt-5 w-full rounded-2xl bg-ink py-3.5 text-sm font-black text-white transition hover:bg-ink-3"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
