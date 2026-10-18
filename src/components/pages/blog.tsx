"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { useContent } from "@/lib/content-context";

/* ============================================================
   صفحه وبلاگ — لیست مقالات با لینک واقعی به /blog/<slug>
   (قبل از این، مقاله‌ها در مودال باز می‌شدند و گوگل نمی‌توانست
   هیچ مقاله‌ای را جداگانه ایندکس کند — اکنون هر مقاله URL دارد)
   ============================================================ */

export function BlogPage() {
  const { site: SITE, blogPosts: BLOG_POSTS } = useContent();

  return (
    <>
      <PageHero
        crumb="وبلاگ"
        eyebrow="وبلاگ های آموزشی"
        title="مقالات جراحی فک و صورت دکتر حامد کرمانی"
        desc="مطالب آموزشی درباره جراحی فک و صورت، پروتز و جراحی مفاصل گیجگاهی، ایمپلنت و جراحی های دندانی و هزینه های درمان."
      />

      <section className="bg-bone py-20" aria-label="لیست مقالات">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {BLOG_POSTS.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 2) * 0.1}>
                <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-xl hover:shadow-teal/10">
                  <Link
                    href={`/blog/${p.slug}`}
                    aria-label={`خواندن مقاله: ${p.title}`}
                    className="flex h-full flex-col"
                  >
                    {p.cover ? (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/5">
                        <Image
                          src={p.cover}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 560px"
                          className="object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-7">
                      <div className="flex items-center gap-3 text-xs text-foreground/50">
                        <span className="rounded-full bg-teal/10 px-3 py-1 font-bold text-teal-3">
                          {p.date}
                        </span>
                        <span>نویسنده: دکتر حامد کرمانی</span>
                      </div>
                      <h2 className="mt-4 text-xl font-black leading-8">{p.title}</h2>
                      <p className="mt-3 flex-1 text-sm leading-8 text-foreground/65">
                        {p.excerpt}
                      </p>
                      <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-3 transition group-hover:gap-3">
                        ادامه مطلب
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                          <path d="M19 12H5m6-6l-6 6 6 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="mt-12">
            <div className="rounded-3xl bg-ink p-8 text-white sm:p-10">
              <h3 className="text-lg font-black">پرسش های خود را از جراح بپرسید</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                اگر سوال جراحی دارید که پاسخ آن را در مقالات پیدا نکردید، از طریق
                واتسپ یا تماس تلفنی با مطب در میان بگذارید: {SITE.phoneDisplay}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
