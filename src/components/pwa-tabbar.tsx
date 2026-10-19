"use client";

/* ============================================================
   PWA Tab Bar — منوی پایین حالت اپلیکیشن نصب‌شده
   فقط وقتی سایت به‌صورت اپ نصب شده اجرا شود (display-mode:
   standalone یا minimal-ui) این نوار نمایش داده می‌شود —
   دقیقاً مثل منوی پایین اپ‌های واقعی. در مرورگر عادی و پنل
   ادمین هرگز رندر نمی‌شود. padding پایین صفحه و جای
   دکمه‌های شناور هم با CSS فقط در حالت standalone تنظیم
   می‌شود تا هیچ‌چیز زیر نوار پنهان نشود.
   ============================================================ */

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  {
    path: "/",
    label: "خانه",
    icon: (
      <>
        <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.8V21h14V9.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 21v-5.5h4V21" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    path: "/gallery",
    label: "گالری",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M21 16.5L16.5 12 9 19.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    path: "/costs",
    label: "هزینه‌ها",
    icon: (
      <>
        <path
          d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
  },
  {
    path: "/blog",
    label: "وبلاگ",
    icon: (
      <>
        <path d="M2 4h6a4 4 0 014 4v12a3 3 0 00-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 4h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    path: "/contact",
    label: "تماس",
    icon: (
      <path
        d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function PwaTabbar() {
  const pathname = usePathname();

  /* padding پایین body فقط وقتی نوار واقعاً رندر شده (خارج از ادمین) —
     CSS خودش در حالت standalone اعمال می‌کند، در مرورگر عادی بی‌اثر است */
  useEffect(() => {
    const on = !pathname.startsWith("/admin");
    document.body.classList.toggle("pwa-tabbar-on", on);
    return () => document.body.classList.remove("pwa-tabbar-on");
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      aria-label="منوی اصلی اپلیکیشن"
      className="pwa-tabbar fixed inset-x-0 bottom-0 z-[95] items-stretch justify-around border-t border-white/10 bg-ink-3/95 shadow-[0_-10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      {/* خط طلایی بالای نوار — امضای تم Kinpaku */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-soft/70 to-transparent"
      />
      {TABS.map((tab) => {
        const active = tab.path === "/" ? pathname === "/" : pathname.startsWith(tab.path);
        return (
          <Link
            key={tab.path}
            href={tab.path}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 pb-2 pt-2.5 text-[10.5px] font-bold leading-none transition-colors duration-300 ${
              active ? "text-gold-soft" : "text-white/55 hover:text-white/90"
            }`}
          >
            {active && (
              <motion.span
                layoutId="pwa-tab-glow"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute top-0 h-[3px] w-9 rounded-b-full bg-gold-soft shadow-[0_0_12px_rgba(233,207,135,0.8)]"
              />
            )}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={active ? 2 : 1.6}
              aria-hidden
              className="transition-transform duration-300"
            >
              {tab.icon}
            </svg>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
