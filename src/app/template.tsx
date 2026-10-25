"use client";

/* ============================================================
   Template — چارچوب تغییر مسیر (کل سایت)
   در App Router هر ناوبری، template دوباره mount می‌شود.

   ⚠️ نکته GEO (ممیزی geo-optimizer-skill): نسخه قبلی کل صفحه را
   در motion.div با initial={{ opacity: 0 }} می‌پیچید — framer-motion
   این را به‌صورت استایل اینلاین «opacity:0» داخل HTML سروری
   می‌نوشت و خزنده‌های AI کل صفحه را «متن پنهان» می‌دیدند
   (الگوی cloaking؛ ۴۹ عنصر پرچم‌شده در ممیزی).
   ضمناً روی display:contents هیچ باکسی وجود ندارد؛ انیمیشن
   عملاً دیده نمی‌شد — پس wrapper ساده دقیقاً همان ظاهر را دارد
   بدون هیچ استایل اینلاین مخفی.
   ============================================================ */

import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="contents">
      {children}
    </div>
  );
}
