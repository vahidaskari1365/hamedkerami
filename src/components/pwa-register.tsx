"use client";

/* ============================================================
   PWA Runtime — دکتر حامد کرمانی
   ۱) ثبت Service Worker + فعال‌سازی خودکار نسخه جدید
   ۲) کارت «نصب اپلیکیشن» (اندروید/دسکتاپ با beforeinstallprompt)
   ۳) راهنمای «افزودن به صفحه اصلی» برای iOS (سافاری رویداد
      beforeinstallprompt ندارد — مراحل دستی نشان داده می‌شود)
   کارت هر ۱۴ روز پس از بستن، دوباره فرصت نمایش می‌گیرد و
   در حالت standalone یا پنل ادمین هرگز نمایش داده نمی‌شود.
   ============================================================ */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/* ---------- capture install event at module load (before hydration) ---------- */
declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent;
  }
}
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/* رویداد معمولاً قبل از هیدریشن React fire می‌شود — در سطح ماژول
   گیرنده می‌گذاریم تا هیچ‌وقت از دست نرود */
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("pwa-installable"));
  });
  window.addEventListener("appinstalled", () => {
    try {
      localStorage.setItem("pwa-install-installed", "1");
    } catch {
      /* noop */
    }
  });
  /* کلاس standalone روی <html> — علاوه بر media query، iOS قدیمی
     (که (display-mode: standalone) در CSS ندارد) را هم با
     navigator.standalone پوشش می‌دهد و منوی پایین اپ را فعال می‌کند */
  try {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) document.documentElement.classList.add("pwa-standalone");
  } catch {
    /* noop */
  }
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // iPadOS 13+ خودش را Mac معرفی می‌کند — با پشتیبانی touch تشخیص داده می‌شود
  const iPadMac =
    /Macintosh/.test(ua) && (window.navigator.maxTouchPoints ?? 0) > 1;
  return /iphone|ipad|ipod/i.test(ua) || iPadMac;
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!at) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PwaRegister() {
  const pathname = usePathname();
  const [installable, setInstallable] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [busy, setBusy] = useState(false);

  /* ---------- service worker registration ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.location.protocol.startsWith("http")) return; // file:// preview
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return; // keep local dev hot-reload clean
    }

    let reloaded = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        const activateWaiting = () => {
          registration.waiting?.postMessage("SKIP_WAITING");
        };

        activateWaiting();

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              activateWaiting();
            }
          });
        });
      })
      .catch(() => {
        /* SW unavailable — site works normally */
      });

    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  /* ---------- eligibility (تأخیر async — سازگار با قاعده set-state-in-effect) ---------- */
  useEffect(() => {
    if (isStandalone()) return;
    let cancelled = false;
    const init = setTimeout(() => {
      if (cancelled) return;
      try {
        if (localStorage.getItem("pwa-install-installed") === "1") return;
      } catch {
        /* private mode */
      }
      if (recentlyDismissed()) return;
      if (window.__pwaDeferredPrompt) {
        setInstallable(true);
      } else if (isIos()) {
        setIosMode(true);
      }
    }, 0);
    const onInstallable = () => {
      if (!cancelled) setInstallable(true);
    };
    window.addEventListener("pwa-installable", onInstallable);
    return () => {
      cancelled = true;
      clearTimeout(init);
      window.removeEventListener("pwa-installable", onInstallable);
    };
  }, []);

  /* ---------- delayed show (بدون مزاحمت با لود اولیه) ---------- */
  useEffect(() => {
    if (!installable && !iosMode) return;
    const t = setTimeout(() => setShowCard(true), 5000);
    return () => clearTimeout(t);
  }, [installable, iosMode]);

  /* ---------- admin: کارت نمایش داده نمی‌شود (derived در رندر) ---------- */

  /* ---------- actions ---------- */
  const dismiss = () => {
    setShowCard(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode */
    }
  };

  const install = async () => {
    const prompt = window.__pwaDeferredPrompt;
    if (!prompt) return;
    setBusy(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      window.__pwaDeferredPrompt = undefined;
      if (outcome === "accepted") {
        try {
          localStorage.setItem("pwa-install-installed", "1");
        } catch {
          /* noop */
        }
      }
      setShowCard(false);
    } catch {
      setShowCard(false);
    } finally {
      setBusy(false);
    }
  };

  if (!showCard || pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-label={iosMode ? "راهنمای نصب روی آیفون" : "نصب اپلیکیشن دکتر کرمانی"}
        className="fixed bottom-5 right-5 z-[90] w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl bg-ink-3/95 p-4 shadow-2xl shadow-black/40 ring-1 ring-teal/30 backdrop-blur-xl sm:bottom-6 sm:right-6"
      >
        <button
          onClick={dismiss}
          aria-label="بستن"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
            <Image src="/images/logo.png" alt="لوگوی دکتر حامد کرمانی" fill sizes="48px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1 pl-8">
            {iosMode ? (
              <>
                <p className="text-sm font-extrabold text-white">افزودن به صفحه اصلی آیفون</p>
                <ol className="mt-1.5 list-decimal space-y-1 pr-4 text-[12.5px] leading-6 text-white/75">
                  <li>روی دکمه «Share» (مربع با فلش رو به بالا) بزنید</li>
                  <li>گزینه «Add to Home Screen» را انتخاب کنید</li>
                  <li>روی «Add» بزنید — اپ آماده است</li>
                </ol>
                <button
                  onClick={dismiss}
                  className="mt-3 rounded-full bg-teal px-4 py-2 text-[13px] font-bold text-ink transition hover:bg-gold-soft"
                >
                  متوجه شدم
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-white">نصب اپلیکیشن دکتر کرمانی</p>
                <p className="mt-1 text-[12.5px] leading-6 text-white/75">
                  با یک لمس رزرو نوبت، تعرفه‌ها و مقالات را حتی آفلاین ببینید.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={install}
                    disabled={busy}
                    className="rounded-full bg-teal px-4 py-2 text-[13px] font-bold text-ink shadow-lg shadow-teal/25 transition hover:bg-gold-soft disabled:opacity-60"
                  >
                    {busy ? "در حال نصب…" : "نصب رایگان"}
                  </button>
                  <button
                    onClick={dismiss}
                    className="rounded-full px-3 py-2 text-[13px] font-semibold text-white/60 transition hover:text-white"
                  >
                    بعداً
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
