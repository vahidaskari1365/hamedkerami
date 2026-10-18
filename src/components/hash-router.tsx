"use client";

/* ============================================================
   روتر سایت — از این فایل قبلاً به‌عنوان hash-router استفاده می‌شد.
   برای سئو، همه صفحات به مسیرهای واقعی Next.js مهاجرت کردند؛
   این فایل حالا یک لایه‌ی سازگار (alias) روی روتر واقعی است تا
   کامپوننت‌های قبلی بدون تغییر کار کنند.
   ============================================================ */

import Link from "next/link";
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from "next/navigation";
import { useEffect, type ReactNode } from "react";

export { Link };

export function usePathname(): string {
  return useNextPathname() ?? "/";
}

export function useRouter() {
  const router = useNextRouter();
  const path = useNextPathname() ?? "/";
  return {
    path,
    navigate: (to: string) => {
      if (path === to) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push(to);
    },
  };
}

/* فقط برای سازگاری با کد قبلی — بدون عملکرد (روتر واقعی Next کار می‌کند) */
export function HashRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/* ============================================================
   ریدایرکت لینک‌های قدیمی هش‌دار (/  #/gallery  →  /gallery)
   لینک‌های اشتراک‌گذاری‌شده و بوکمارک‌شده قبلی را به URL واقعی
   می‌برد تا گوگل هم بتواند با ریدایرکت نرم، ایندکس را منتقل کند.
   ============================================================ */
const LEGACY_ROUTES = [
  "about",
  "services",
  "costs",
  "gallery",
  "blog",
  "contact",
  "admin",
];

export function LegacyHashRedirect() {
  const router = useNextRouter();
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash;
      if (!h.startsWith("#/")) return;
      const target = h.slice(1); // "/gallery" یا "/blog" ...
      const first = target.split("/")[1];
      if (LEGACY_ROUTES.includes(first)) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        router.replace(target);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [router]);
  return null;
}
