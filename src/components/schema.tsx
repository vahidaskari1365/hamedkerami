import { SITE } from "@/lib/data";

/* ============================================================
   ابزارهای Structured Data (JSON-LD) — سئو + AEO + GEO
   اسکریپت امن (escape تگ بسته‌شدن) + سازنده BreadcrumbList
   ============================================================ */

export function JsonLdScript({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList — برای تمام صفحات داخلی (سئو + نمایش مسیر در نتایج) */
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: SITE.url },
      ...crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.name,
        item: `${SITE.url}${c.path}`,
      })),
    ],
  };
}

/* ============================================================
   VideoObject — آماده‌سازی ویدئو (AIO/GEO)
   هر ویدئوی آپارات/یوتیوب که به VIDEOS.items در data.ts اضافه
   شود، با این سازنده JSON-LD معتبر می‌گیرد و شانس اسنیپت ویدئو
   و نقل‌قول در دستیارهای هوشمند بالا می‌رود.
   ============================================================ */
export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumb: string; // تصویر بندانگشتی (مسیر سایت یا URL کامل)
  upload: string; // تاریخ انتشار «YYYY-MM-DD»
  embed: string; // لینک پخش/ embed آپارات یا یوتیوب
}

export function videoLd(v: VideoItem) {
  const thumb = v.thumb.startsWith("http") ? v.thumb : `${SITE.url}${v.thumb}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${SITE.url}/#video-${v.id}`,
    name: v.title,
    description: v.description,
    thumbnailUrl: [thumb],
    uploadDate: v.upload,
    embedUrl: v.embed,
    contentUrl: v.embed,
    inLanguage: "fa-IR",
    publisher: { "@id": `${SITE.url}/#physician` },
  };
}
