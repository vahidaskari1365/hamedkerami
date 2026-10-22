"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

/* ============================================================
   مقایسه تعاملی قبل و بعد — نسخه پرتره (تمام‌چهره)
   قبلاً کادر افقی ۳/۲ بود و عکس‌های عمودی کلینیک را قوی
   کراپ می‌کرد (فقط پیشانی دیده می‌شد)؛ اکنون کادر عمودی ۴/۵
   با object-center است تا تمام چهره در دو «پرده» دیده شود.
   برچسب‌ها فارسی شدند (قبل/بعد) و دستگیره هم شیک‌تر شد.
   ============================================================ */

export function BeforeAfter({
  before,
  after,
  label,
  hint = "دستگیره وسط تصویر را به طرفین بکشید",
  priority = false,
}: {
  before: string;
  after: string;
  label: string;
  hint?: string;
  priority?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, x)));
  }, []);

  return (
    <figure className="group mx-auto w-full max-w-xl">
      <div
        ref={ref}
        dir="ltr"
        className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-2xl bg-ink cursor-ew-resize shadow-xl shadow-ink/25 ring-1 ring-ink/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-ink/30"
        onPointerDown={(e) => {
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          update(e.clientX);
        }}
        onPointerMove={(e) => dragging && update(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        role="slider"
        aria-label={`مقایسه قبل و بعد ${label}`}
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 4));
          if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 4));
        }}
      >
        {/* after (base) — بعد از جراحی */}
        <Image
          src={after}
          alt={`${label} — بعد از جراحی`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 576px"
          className="object-cover object-center"
        />
        {/* before (clipped) — قبل از جراحی */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={before}
            alt={`${label} — قبل از جراحی`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 576px"
            className="object-cover object-center"
          />
          <span className="absolute top-4 left-4 rounded-full bg-ink/75 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur">
            قبل
          </span>
        </div>
        <span className="absolute top-4 right-4 rounded-full bg-teal/90 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur">
          بعد
        </span>

        {/* handle — دستگیره */}
        <div
          className="absolute inset-y-0 w-[3px] bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.55)]"
          style={{ left: `${pos}%` }}
        >
          <span
            className={`absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/20 shadow-xl backdrop-blur-md transition-transform duration-300 ${
              dragging ? "scale-110 bg-white/30" : "group-hover:scale-105"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-extrabold">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </figcaption>
    </figure>
  );
}
