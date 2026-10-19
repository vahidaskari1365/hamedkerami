"use client";

/* ============================================================
   Template — ترنزیشن سینمایی روی تغییر مسیر (کل سایت)
   در App Router هر ناوبری، template دوباره mount می‌شود و
   انیمیشن ورود نرم اجرا می‌کند (fade + rise). سبک و بدون
   جلوگیری از رندر — فقط یک لایه بصری.
   ============================================================ */

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
