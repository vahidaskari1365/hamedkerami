"use client";

import { ReactNode } from "react";

/* ============================================================
   MasonryGrid — چیدمان Pinterest (آبشاری)
   ستون‌های CSS با break-inside-avoid: کارت‌ها با ارتفاع‌های
   متفاوت مثل پینترست در ستون‌ها آبشاری می‌شوند؛ بدون کتابخانه
   خارجی، بدون جاوااسکریپت چیدمان — سبک و بدون layout-shift.
   gap با margin داخلی کنترل می‌شود (روش استاندارد CSS columns).
   ============================================================ */

export function MasonryGrid({
  children,
  className = "",
  cols = "columns-2 sm:columns-2 lg:columns-3",
  gap = "gap-5",
}: {
  children: ReactNode;
  className?: string;
  cols?: string;
  gap?: string;
}) {
  return (
    <div className={`${cols} ${gap} [&>*]:mb-5 [&>*]:break-inside-avoid ${className}`}>
      {children}
    </div>
  );
}

/* الگوی نسبت‌های تصویر برای حس Pinterest (تنوع ارتفاع کارت‌ها) */
export const MASONRY_ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[9/16]",
  "aspect-[1/1]",
  "aspect-[2/3]",
  "aspect-[3/4]",
] as const;

export function masonryAspect(i: number): string {
  return MASONRY_ASPECTS[i % MASONRY_ASPECTS.length];
}
