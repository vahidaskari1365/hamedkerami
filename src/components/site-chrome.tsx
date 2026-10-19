"use client";

/* ============================================================
   SiteShell — چارچوب مشترک صفحات واقعی سایت (App Router)
   شامل: Provider محتوای دیتابیس، نوار بالا، فوتر، دکمه‌های
   شناور تماس، ثبت آمار بازدید و ریدایرکت لینک‌های هش قدیمی.
   (جایگزین AppShell هش‌محور — برای سئو همه صفحات URL واقعی دارند)
   ============================================================ */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollProgress, CinemaIntro } from "@/components/cinematic";
import { PwaTabbar } from "@/components/pwa-tabbar";
import { PwaInstallPill } from "@/components/pwa-install-pill";
import { LegacyHashRedirect } from "@/components/hash-router";
import { ContentProvider, useContent } from "@/lib/content-context";
import { waLink } from "@/lib/data";

/* ---------- آمار بازدید: هر مسیر واقعی یک view ثبت می‌کند ---------- */
function Tracker() {
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

/* Floating quick-contact actions */
function FloatingActions() {
  const path = usePathname();
  const { site: SITE } = useContent();
  if (path.startsWith("/admin")) return null;
  return (
    <div className="floating-actions fixed bottom-5 left-5 z-[85] flex flex-col gap-3">
      <a
        href={`tel:${SITE.phone}`}
        aria-label="تماس تلفنی با مطب"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-ink p-3.5 text-white shadow-xl ring-1 ring-white/15 transition hover:scale-105 hover:bg-ink-3"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
        </svg>
      </a>
      <a
        href={waLink(SITE.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="گفتگو در واتسپ"
        className="flex items-center justify-center rounded-full bg-teal p-3.5 text-white shadow-xl transition hover:scale-105 hover:bg-teal-2"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z" />
        </svg>
      </a>
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider>
      <LegacyHashRedirect />
      <div className="flex min-h-screen flex-col">
        <CinemaIntro />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
        <PwaInstallPill />
        <PwaTabbar />
        <Tracker />
      </div>
    </ContentProvider>
  );
}
