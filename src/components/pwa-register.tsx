"use client";

/* ============================================================
   PWA Runtime — دکتر حامد کرمانی (نسخه بدون کارت نصب)
   ۱) ثبت Service Worker + فعال‌سازی خودکار نسخه جدید + آفلاین
   ۲) کلاس pwa-standalone روی <html> در حالت نصب‌شده — کلید
      نمایش منوی پایین اپلیکیشن (PwaTabbar)
   کارت «نصب اپلیکیشن» و راهنمای iOS طبق درخواست حذف شد؛
   کاربران همچنان از منوی خود مرورگر (آیکن نصب در نوار آدرس
   یا Share → Add to Home Screen) می توانند نصب کنند.
   ============================================================ */

import { useEffect } from "react";

/* ---------- تشخیص standalone قبل از هیدریشن (در سطح ماژول) ---------- */
if (typeof window !== "undefined") {
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

export function PwaRegister() {
  /* ---------- ثبت Service Worker + فعال‌سازی خودکار نسخه جدید ---------- */
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

  return null;
}
