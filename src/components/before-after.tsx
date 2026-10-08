"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export function BeforeAfter({
  before,
  after,
  label,
  hint = "جهت مشاهده قبل و بعد، دستگیره وسط عکس را به طرفین بکشید",
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
    <figure className="group">
      <div
        ref={ref}
        dir="ltr"
        className="relative aspect-[4/3] sm:aspect-[3/2] w-full select-none overflow-hidden rounded-2xl bg-ink cursor-ew-resize shadow-2xl shadow-ink/30"
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
        {/* after (base) */}
        <Image
          src={after}
          alt={`${label} — بعد از جراحی`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top"
        />
        {/* before (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={before}
            alt={`${label} — قبل از جراحی`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top"
          />
          <span className="absolute top-4 left-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            Before
          </span>
        </div>
        <span className="absolute top-4 right-4 rounded-full bg-teal/90 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          After
        </span>

        {/* handle */}
        <div
          className="absolute inset-y-0 w-[3px] bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.6)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/15 backdrop-blur-md transition-transform group-active:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-muted-foreground">{hint}</span>
      </figcaption>
    </figure>
  );
}
