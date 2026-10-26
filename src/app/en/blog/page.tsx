import type { Metadata } from "next";
import { JsonLdScript } from "@/components/schema";
import { EnBlogPage } from "@/components/en/en-blog";
import { getPublishedPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/blog — فهرست انگلیسی وبلاگ (چارچوب LTR انگلیسی)
   مقالات زنده دیتابیس سروری خوانده و به کامپوننت کلاینت
   پاس داده می‌شود؛ جستجوی زنده با واژه‌نامه EN→FA.
   hreflang: fa → /blog
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Jaw Surgery Blog — Orthognathic, Genioplasty & Implant Articles | Dr. Hamed Kermani",
  },
  description:
    "Educational articles by Dr. Hamed Kermani, oral & maxillofacial surgeon in Tehran: orthognathic jaw surgery, genioplasty, TMJ disorders, dental implants, recovery care and transparent treatment costs. Live search included.",
  alternates: {
    canonical: "/en/blog",
    languages: { fa: "/blog", en: "/en/blog", "x-default": "/en/blog" },
  },
  openGraph: {
    title: "Jaw Surgery Blog — Dr. Hamed Kermani, Tehran",
    description:
      "In-depth articles on jaw surgery, chin surgery, dental implants and treatment costs — with a live search box.",
    url: `${SITE.url}/en/blog`,
    type: "website",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Jaw surgery blog — Dr. Hamed Kermani" }],
  },
};

export default async function EnBlogRoute() {
  const posts = await getPublishedPosts();

  return (
    <>
      <EnBlogPage
        posts={posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          body: p.body,
          cover: p.cover,
          date: p.date,
        }))}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${SITE.url}/en/blog#blog`,
          url: `${SITE.url}/en/blog`,
          name: "Jaw Surgery Blog — Dr. Hamed Kermani",
          inLanguage: "en",
          publisher: { "@id": `${SITE.url}/#physician` },
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/en/blog` },
          ],
        }}
      />
    </>
  );
}
