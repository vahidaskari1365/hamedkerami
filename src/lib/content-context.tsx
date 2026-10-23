"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import {
  BIO,
  BEFORE_AFTER,
  BLOG_POSTS,
  CERTIFICATES,
  EDUCATION,
  FAQ,
  GALLERY_CATS,
  GALLERY_CASES,
  HERO,
  HOURS,
  IMPLANT_COSTS,
  JAW_COSTS,
  PORTFOLIO_COVERS,
  SERVICE_EXTRAS,
  SERVICES,
  SITE,
  STATS,
  SUCCESS_RATES,
  TEAM,
  VIDEOS,
} from "@/lib/data";

/* ============================================================
   کانتکست محتوای زنده‌ی سایت
   صفحات به جای import مستقیم از data.ts، از این کانتکست می‌خوانند؛
   محتوا از /api/content (دیتابیس) می‌آید و بعد از هر ویرایش ادمین
   با refreshSiteContent() تازه می‌شود.
   ============================================================ */

const FALLBACK: SiteContent = {
  brand: { logoImage: "/images/logo.png" },
  site: SITE,
  hero: HERO,
  about: BIO,
  videos: VIDEOS,
  stats: STATS,
  successRates: SUCCESS_RATES,
  services: SERVICES,
  serviceExtras: SERVICE_EXTRAS,
  education: EDUCATION,
  team: TEAM,
  jawCosts: JAW_COSTS,
  implantCosts: IMPLANT_COSTS,
  blogPosts: BLOG_POSTS,
  beforeAfter: BEFORE_AFTER,
  galleryCases: GALLERY_CASES,
  galleryCats: GALLERY_CATS,
  portfolioCovers: PORTFOLIO_COVERS,
  certificates: CERTIFICATES,
  faq: FAQ,
  hours: HOURS,
  fromDb: false,
};

const ContentCtx = createContext<SiteContent>(FALLBACK);

let refreshFn: (() => void) | null = null;

/** بعد از ویرایش ادمین، محتوای زنده‌ی سایت را دوباره می‌خواند */
export function refreshSiteContent(): void {
  refreshFn?.();
}

export function ContentProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  /** محتوای رندر سروری — از SiteShell پاس داده می‌شود تا HTML اولیه واقعی باشد (AEO/GEO) */
  initialContent?: SiteContent;
}) {
  const [content, setContent] = useState<SiteContent>(initialContent ?? FALLBACK);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/content", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && d?.ok && d.content) setContent(d.content);
        })
        .catch(() => {});
    };
    load();
    refreshFn = load;
    return () => {
      alive = false;
      refreshFn = null;
    };
  }, []);

  return <ContentCtx.Provider value={content}>{children}</ContentCtx.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentCtx);
}
