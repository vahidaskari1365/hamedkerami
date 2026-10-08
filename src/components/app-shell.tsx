"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { HashRouter, usePathname } from "@/components/hash-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageTransition, ScrollProgress } from "@/components/cinematic";
import { HomePage } from "@/components/pages/home";
import { AboutPage } from "@/components/pages/about";
import { ServicesPage } from "@/components/pages/services";
import { CostsPage } from "@/components/pages/costs";
import { GalleryPage } from "@/components/pages/gallery";
import { BlogPage } from "@/components/pages/blog";
import { ContactPage } from "@/components/pages/contact";
import { SITE } from "@/lib/data";

const ROUTE_TITLES: Record<string, string> = {
  "/": "دکتر حامد کرمانی | متخصص جراحی فک و صورت در تهران",
  "/about": "درباره دکتر کرمانی | رزومه و سوابق جراحی فک و صورت",
  "/services": "خدمات | جراحی فک، جنیوپلاستی، بلفاروپلاستی و ایمپلنت",
  "/costs": "هزینه جراحی فک و صورت و ایمپلنت دندان",
  "/gallery": "گالری نمونه جراحی های فک و صورت | قبل و بعد",
  "/blog": "وبلاگ آموزشی جراحی فک و صورت | دکتر حامد کرمانی",
  "/contact": "تماس با ما | رزرو نوبت مطب دکتر حامد کرمانی",
};

function Pages() {
  const path = usePathname();

  useEffect(() => {
    document.title = ROUTE_TITLES[path] ?? ROUTE_TITLES["/"];
  }, [path]);

  const page = (() => {
    switch (path) {
      case "/about":
        return <AboutPage />;
      case "/services":
        return <ServicesPage />;
      case "/costs":
        return <CostsPage />;
      case "/gallery":
        return <GalleryPage />;
      case "/blog":
        return <BlogPage />;
      case "/contact":
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  })();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition routeKey={path}>{page}</PageTransition>
    </AnimatePresence>
  );
}

/* Floating quick-contact actions */
function FloatingActions() {
  return (
    <div className="fixed bottom-5 left-5 z-[85] flex flex-col gap-3">
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
        href={`https://wa.me/${SITE.whatsapp}`}
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

export function AppShell() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <ScrollProgress />
        <Navbar />
        <Pages />
        <Footer />
        <FloatingActions />
      </div>
    </HashRouter>
  );
}
