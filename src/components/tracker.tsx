"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* ---------- آمار بازدید: هر مسیر واقعی یک view ثبت می‌کند ---------- */
export function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith("/admin")) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer || "" }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}
