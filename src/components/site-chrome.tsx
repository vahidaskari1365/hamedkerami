"use client";

/* ============================================================
   SiteShell — چارچوب مشترک صفحات واقعی سایت (App Router)
   شامل: Provider محتوای دیتابیس، نوار بالا، فوتر، داک شناور
   تماس، ثبت آمار بازدید و ریدایرکت لینک‌های هش قدیمی.
   (جایگزین AppShell هش‌محور — برای سئو همه صفحات URL واقعی دارند)
   ============================================================ */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollProgress, CinemaIntro } from "@/components/cinematic";
import { PwaTabbar } from "@/components/pwa-tabbar";
import { PwaInstallPill } from "@/components/pwa-install-pill";
import { ContactDock } from "@/components/contact-dock";
import { LegacyHashRedirect } from "@/components/hash-router";
import { ContentProvider } from "@/lib/content-context";
import { HtmlLang } from "@/components/html-lang";

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

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider>
      <HtmlLang lang="fa" dir="rtl" />
      <LegacyHashRedirect />
      <div className="flex min-h-screen flex-col">
        <CinemaIntro />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ContactDock />
        <PwaInstallPill />
        <PwaTabbar />
        <Tracker />
      </div>
    </ContentProvider>
  );
}
