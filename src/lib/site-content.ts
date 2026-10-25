import { db } from "@/lib/db";
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
   خواندن کل محتوای سایت از دیتابیس (با fallback به data.ts)
   در API عمومی /api/content و متادیتای layout استفاده می‌شود
   ============================================================ */

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* لوگوی پیش‌فرض — قابل تغییر از تنظیمات (brand.logoImage) */
const BRAND = { logoImage: "/images/logo.png" };

export async function getSiteContent() {
  try {
    const [
      settings,
      services,
      extras,
      education,
      team,
      stats,
      successRates,
      costs,
      blogPosts,
      cases,
      covers,
      certificates,
      faq,
      hours,
      pairs,
    ] = await Promise.all([
      db.setting.findMany(),
      db.service.findMany({ orderBy: { order: "asc" } }),
      db.serviceExtra.findMany({ orderBy: { order: "asc" } }),
      db.education.findMany({ orderBy: { order: "asc" } }),
      db.teamMember.findMany({ orderBy: { order: "asc" } }),
      db.stat.findMany({ orderBy: { order: "asc" } }),
      db.successRate.findMany({ orderBy: { order: "asc" } }),
      db.costItem.findMany({ orderBy: { order: "asc" } }),
      db.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
      db.galleryCase.findMany({ orderBy: { order: "asc" } }),
      db.portfolioCover.findMany({ orderBy: { order: "asc" } }),
      db.certificate.findMany({ orderBy: { order: "asc" } }),
      db.faq.findMany({ orderBy: { order: "asc" } }),
      db.hour.findMany({ orderBy: { order: "asc" } }),
      db.beforeAfterPair.findMany(),
    ]);

    const settingMap: Record<string, unknown> = {};
    for (const s of settings) {
      try {
        settingMap[s.key] = JSON.parse(s.value);
      } catch {
        settingMap[s.key] = s.value;
      }
    }

    const points = (s: { points: string }): string[] => parse(s.points, [] as string[]);
    const jawCosts = costs.filter((c) => c.category === "jaw");
    const implantCosts = costs.filter((c) => c.category === "implant");
    const pair = (key: string) => pairs.find((p) => p.key === key);

    const bimax = pair("bimax");
    const blepharo = pair("blepharo");
    const main = pair("main");

    /* اگر دیتابیس خالی باشد (قبل از seed) از داده‌ی ثابت استفاده می‌کنیم */
    const empty = services.length === 0 && cases.length === 0 && blogPosts.length === 0;

    if (empty) {
      return {
        brand: BRAND,
        site: SITE,
        hero: HERO,
        about: BIO,
        videos: VIDEOS,
        stats: STATS,
        successRates: SUCCESS_RATES,
        services: SERVICES.map((s) => ({ ...s, points: s.points, published: true })),
        serviceExtras: SERVICE_EXTRAS,
        education: EDUCATION,
        team: TEAM.map((t) => ({ ...t, image: t.image ?? "" })),
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
        lastUpdated: null,
        fromDb: false,
      };
    }

    return {
      brand: { ...BRAND, ...(settingMap.brand as object | undefined) },
      /* url همیشه از build می آید — دیتابیس سرورهای قدیمی دامنه قبلی دارند؛
         تغییر دامنه فقط با دیپلوی معنا دارد نه از پنل ادمین */
      site: { ...SITE, ...(settingMap.site as object | undefined), url: SITE.url },
      hero: { ...HERO, ...(settingMap.hero as object | undefined) },
      about: { ...BIO, ...(settingMap.about as object | undefined) },
      videos: { ...VIDEOS, ...(settingMap.videos as object | undefined) },
      stats: stats.length
        ? stats.map((s) => ({ value: s.value, label: s.label, suffix: s.suffix }))
        : STATS,
      successRates: successRates.length
        ? successRates.map((s) => ({ rate: s.rate, title: s.title, detail: s.detail }))
        : SUCCESS_RATES,
      services: services.length
        ? services.map((s) => ({
            slug: s.slug,
            title: s.title,
            latin: s.latin,
            desc: s.desc,
            image: s.image,
            points: points(s),
          }))
        : SERVICES.map((s) => ({ ...s, points: s.points })),
      serviceExtras: extras.length
        ? extras.map((e) => ({ title: e.title, desc: e.desc }))
        : SERVICE_EXTRAS,
      education: education.length
        ? education.map((e) => ({ year: e.year, title: e.title, place: e.place }))
        : EDUCATION,
      team: team.length
        ? team.map((t) => ({ name: t.name, role: t.role, image: t.image || null }))
        : TEAM,
      jawCosts: jawCosts.length
        ? jawCosts.map((c) => ({ item: c.item, price: c.price }))
        : JAW_COSTS,
      implantCosts: implantCosts.length
        ? implantCosts.map((c) => ({ item: c.item, price: c.price }))
        : IMPLANT_COSTS,
      /* fallback بخش‌به‌بخش — اگر فقط وبلاگ خالی بود، مقالات ثابت نمایش داده شوند */
      blogPosts: blogPosts.length
        ? blogPosts.map((b) => ({
            slug: b.slug,
            title: b.title,
            date: b.date,
            excerpt: b.excerpt,
            body: b.body,
            cover: b.cover,
          }))
        : BLOG_POSTS,
      beforeAfter: {
        bimax: bimax
          ? { before: bimax.before, after: bimax.after, label: bimax.label }
          : BEFORE_AFTER.bimax,
        blepharo: blepharo
          ? { before: blepharo.before, after: blepharo.after, label: blepharo.label }
          : BEFORE_AFTER.blepharo,
        main: main
          ? { before: main.before, after: main.after, label: main.label }
          : BEFORE_AFTER.main,
      },
      galleryCases: cases.length ? cases.map((c) => ({ src: c.src, cat: c.cat, title: c.title })) : GALLERY_CASES,
      galleryCats:
        cases.length
          ? ["همه", ...Array.from(new Set(cases.map((c) => c.cat).filter(Boolean)))]
          : GALLERY_CATS,
      portfolioCovers: covers.length
        ? covers.map((c) => ({ src: c.src, title: c.title }))
        : PORTFOLIO_COVERS,
      certificates: certificates.length
        ? certificates.map((c) => ({ src: c.src, title: c.title }))
        : CERTIFICATES,
      faq: faq.length ? faq.map((f) => ({ q: f.q, a: f.a })) : FAQ,
      hours: hours.length
        ? hours.map((h) => ({ day: h.day, doctor: h.doctor, time: h.time }))
        : HOURS,
      /* تازه‌ترین تغییر محتوای واقعی — برای dateModified اسکیما و مُهر فوتر
         (سیگنال freshness برای Perplexity و Google G-DATES) */
      lastUpdated: blogPosts.length
        ? blogPosts
            .map((b) => (b.updatedAt > b.createdAt ? b.updatedAt : b.createdAt))
            .reduce((a, b) => (a > b ? a : b))
            .toISOString()
        : null,
      fromDb: true,
    };
  } catch {
    /* خطای دیتابیس — سایت با محتوای ثابت بالا می‌آید */
    return {
      brand: BRAND,
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
      lastUpdated: null,
      fromDb: false,
    };
  }
}

export type SiteContent = Awaited<ReturnType<typeof getSiteContent>>;
