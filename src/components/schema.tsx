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
