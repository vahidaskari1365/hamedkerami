import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import { EnBlogPage } from "@/components/en/en-blog";
import { getPublishedPosts } from "@/lib/blog-posts";
import { EN_ARTICLES } from "@/lib/en-articles";
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
      {/* راهنماهای انگلیسی توریسم پزشکی (فاز ۸) — بعد از فهرست مقالات فارسی */}
      <section className="bg-bone pb-16 sm:pb-20" aria-labelledby="en-guides-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="en-guides-h" className="text-xl font-black text-ink sm:text-2xl">
            Patient guides for international visitors
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-7 text-foreground/60">
            Full English guides on jaw surgery, implants, TMJ and blepharoplasty in Iran —
            costs, surgeon selection, visa and recovery, written for patients from Iraq, Oman,
            Afghanistan, the Gulf and the diaspora.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {EN_ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/en/blog/${a.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/10 transition hover:ring-teal/40"
                >
                  <span>
                    <span className="block text-[13.5px] font-black text-ink">{a.title}</span>
                    <span className="mt-1 block text-[11.5px] text-foreground/55">
                      {a.readMinutes} min read · updated {a.dateModified}
                    </span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-teal" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
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
