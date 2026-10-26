"use client";

/* ============================================================
   EnBlogPage — فهرست وبلاگ در /en/blog (چارچوب انگلیسی LTR)
   مقالات فارسی‌اند؛ کارت‌ها برچسب «Persian article» دارند و
   جستجوی EN با واژه‌نامه EN→FA روی متن فارسی هم جواب می‌دهد
   (مثلاً «cost» → «هزینه»). نتیجه‌ها زنده فیلتر می‌شوند.
   ============================================================ */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EN_BLOG } from "@/lib/en-content";
import { SITE } from "@/lib/data";

export type EnPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  cover: string;
  date: string;
};

function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ|ة/g, "ه")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function EnBlogPage({ posts }: { posts: EnPostCard[] }) {
  const [query, setQuery] = useState("");
  const [featured, ...rest] = posts;

  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const matches = (p: EnPostCard): boolean => {
    if (!tokens.length) return true;
    const hay = normalizeFa(`${p.title} ${p.excerpt} ${p.body ?? ""}`);
    return tokens.every((t) => {
      /* خود توکن + معادل‌های فارسی واژه‌نامه */
      const variants = [t];
      for (const [en, fa] of Object.entries(EN_BLOG.glossary)) {
        if (en === t || normalizeFa(en) === t) variants.push(normalizeFa(fa));
      }
      return variants.some((v) => hay.includes(v));
    });
  };

  const searching = tokens.length > 0;
  const results = useMemo(() => posts.filter(matches), [query, posts]);
  const list = searching ? results : rest;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-white sm:pb-20 sm:pt-44">
        <span className="aurora-orb left-[-6%] top-[-30%] h-64 w-64 bg-teal/25" aria-hidden />
        <span className="aurora-orb right-[-4%] top-[10%] h-48 w-48 bg-[#c9a13b]/20" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-xs font-black tracking-[0.2em] text-teal-3 uppercase">
            {EN_BLOG.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            {EN_BLOG.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65">
            {EN_BLOG.desc}
          </p>
        </div>
      </section>

      <section className="bg-bone py-16" aria-label="Article list">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* ---------- Search box ---------- */}
          <div className="mb-10">
            <label htmlFor="en-blog-search" className="mb-3 block text-sm font-bold text-foreground/80">
              {EN_BLOG.searchLabel}
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-foreground/40"
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="en-blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={EN_BLOG.searchPlaceholder}
                aria-label="Search articles"
                className="w-full rounded-2xl border border-ink/10 bg-card py-4 pl-14 pr-28 text-[15px] font-medium text-foreground shadow-sm outline-none transition-all duration-300 placeholder:text-foreground/35 focus:border-teal/50 focus:shadow-lg focus:shadow-teal/10 focus:ring-4 focus:ring-teal/10"
              />
              {searching ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-ink/8 px-4 py-1.5 text-xs font-bold text-foreground/70 transition hover:bg-ink/15 hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {searching ? (
              <p className="mt-3 text-sm font-bold text-teal-3" role="status" aria-live="polite">
                {results.length}{" "}
                {results.length === 1 ? EN_BLOG.resultsOne : EN_BLOG.resultsMany}
              </p>
            ) : null}
          </div>

          {/* ---------- Featured ---------- */}
          {featured && !searching ? (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-8 grid overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40 md:grid-cols-2"
            >
              {featured.cover ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[300px]">
                  <Image
                    src={featured.cover}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                </div>
              ) : null}
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <span className="flex w-fit items-center gap-2 rounded-full bg-teal/12 px-3.5 py-1.5 text-xs font-bold text-teal-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
                  {EN_BLOG.featured}
                </span>
                <h2 className="mt-4 text-xl font-black leading-9 transition-colors group-hover:text-teal-2 sm:text-2xl sm:leading-10">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-foreground/65">{featured.excerpt}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-2">
                  {EN_BLOG.readArticle}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          ) : null}

          {/* ---------- Grid / results ---------- */}
          {list.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <article
                  key={p.slug}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40"
                >
                  <Link href={`/blog/${p.slug}`} className="flex h-full flex-col">
                    {p.cover ? (
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <Image
                          src={p.cover}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-70" />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="rounded-full bg-teal/10 px-3 py-1 font-bold text-teal-3" dir="ltr">
                          {EN_BLOG.persianBadge}
                        </span>
                        <span className="text-foreground/50" dir="ltr">{p.date}</span>
                      </div>
                      <h3 className="mt-3.5 text-base font-black leading-7 transition-colors group-hover:text-teal-2 sm:text-lg sm:leading-8">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-7 text-foreground/60">
                        {p.excerpt}
                      </p>
                      <span className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-2">
                        {EN_BLOG.readArticle}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : searching && results.length === 0 ? (
            <div className="rounded-3xl bg-card p-8 text-center ring-1 ring-ink/10 sm:p-12">
              <h3 className="text-lg font-black">{EN_BLOG.noResultsTitle}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-foreground/60">
                {EN_BLOG.noResultsDesc}
              </p>
              <a
                href={`tel:${SITE.phone}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink shadow-lg shadow-teal/25 transition hover:scale-[1.03]"
                dir="ltr"
              >
                {SITE.phoneDisplay}
              </a>
            </div>
          ) : null}

          {/* ---------- CTA ---------- */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
            <h3 className="text-lg font-black">{EN_BLOG.askTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {EN_BLOG.askDesc}{" "}
              <a href={`tel:${SITE.phone}`} className="font-bold text-gold-soft hover:underline" dir="ltr">
                {SITE.phoneDisplay}
              </a>
            </p>
            <Link
              href="/en/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink transition hover:scale-[1.03]"
            >
              Book a Visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
