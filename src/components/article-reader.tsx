"use client";

/* ============================================================
   ArticleReader — اجزای تجربه مطالعه مقاله (SXO)
   ۱) نوار پیشرفت مطالعه — بالای صفحه، گرادیان طلایی
   ۲) فهرست مطالب چسبان با هایلایت بخش فعال (IntersectionObserver)
   ۳) فهرست مطالب موبایل — تاشو بالای مقاله
   ۴) دکمه بازگشت به بالا
   ============================================================ */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TocItem } from "@/lib/article-extras";

/* ---------- ۱) نوار پیشرفت مطالعه ---------- */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const y = el.scrollTop || document.body.scrollTop || 0;
      setPct(total > 0 ? Math.min(100, Math.max(0, (y / total) * 100)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[90] h-[3px] bg-transparent"
      role="progressbar"
      aria-label="پیشرفت مطالعه مقاله"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-l from-teal via-gold-soft to-verdigris transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ---------- ۲) فهرست مطالب دسکتاپ — هایلایت بخش فعال ---------- */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;
    const heads = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!heads.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        /* نزدیک‌ترین هدینگِ رد شده از خط ۳۰٪ صفحه فعال است */
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="فهرست مطالب"
      className="sticky top-24 rounded-2xl bg-bone p-5 ring-1 ring-ink/8"
    >
      <p className="flex items-center gap-2 text-xs font-black text-ink">
        <span className="h-4 w-1 rounded-full bg-teal" aria-hidden />
        فهرست مطالب
      </p>
      <ol className="mt-3 space-y-1">
        {items.map((t) => {
          const isActive = active === t.id;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[12px] leading-6 transition ${
                  isActive
                    ? "bg-teal/15 font-black text-teal-3"
                    : "text-foreground/60 hover:bg-ink/4 hover:text-teal-3"
                }`}
              >
                <span className={isActive ? "text-teal" : "text-ink/25"} aria-hidden>
                  •
                </span>
                {t.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- ۳) فهرست مطالب موبایل ---------- */
export function ArticleTocMobile({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <details className="group mt-6 overflow-hidden rounded-2xl bg-bone ring-1 ring-ink/8 xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-black text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-teal" aria-hidden />
          فهرست مطالب ({items.length.toLocaleString("fa-IR")} بخش)
        </span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition group-open:rotate-45"
          aria-hidden
        >
          +
        </span>
      </summary>
      <ol className="space-y-1 border-t border-ink/8 p-3">
        {items.map((t, i) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-7 text-foreground/70 transition hover:bg-teal/10 hover:text-teal-3"
            >
              <span className="mt-0.5 text-teal/70" aria-hidden>
                {i + 1}
              </span>
              {t.title}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/* ---------- ۴) دکمه بازگشت به بالا ---------- */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setShow((document.documentElement.scrollTop || 0) > 700);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="بازگشت به بالای صفحه"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 left-4 z-[86] flex h-11 w-11 items-center justify-center rounded-full bg-ink/85 text-gold-soft shadow-xl ring-1 ring-white/15 backdrop-blur transition hover:bg-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
