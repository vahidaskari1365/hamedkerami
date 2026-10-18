"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { useContent } from "@/lib/content-context";

/* ============================================================
   صفحه وبلاگ — لیست مقالات با لینک واقعی به /blog/<slug>
   کارت جدید Kinpaku: کاور + تاریخ طلایی + هاور لیف؛ مقاله
   نخست به صورت featured تمام عرض نمایش داده می شود.
   ============================================================ */

export function BlogPage() {
  const { site: SITE, blogPosts: BLOG_POSTS } = useContent();
  const [featured, ...rest] = BLOG_POSTS;

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
          {/* مقاله شاخص */}
          {featured ? (
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                aria-label={`خواندن مقاله: ${featured.title}`}
                className="group mb-8 grid overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40 md:grid-cols-2"
              >
                {featured.cover ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[320px]">
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
                    مقاله جدید — {featured.date}
                  </span>
                  <h2 className="mt-4 text-xl font-black leading-9 transition-colors group-hover:text-teal-2 sm:text-2xl sm:leading-10">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-foreground/65 sm:text-[15px]">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-2">
                    خواندن مقاله
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
                      <path d="M19 12H5m6-6l-6 6 6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {/* بقیه مقالات */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.1}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40">
                  <Link
                    href={`/blog/${p.slug}`}
                    aria-label={`خواندن مقاله: ${p.title}`}
                    className="flex h-full flex-col"
                  >
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
                        <span className="rounded-full bg-teal/10 px-3 py-1 font-bold text-teal-3">
                          {p.date}
                        </span>
                        <span className="text-foreground/50">دکتر حامد کرمانی</span>
                      </div>
                      <h3 className="mt-3.5 text-base font-black leading-7 transition-colors group-hover:text-teal-2 sm:text-lg sm:leading-8">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-7 text-foreground/60">
                        {p.excerpt}
                      </p>
                      <span className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-2">
                        ادامه مطلب
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
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
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
              <span className="aurora-orb left-[-4%] top-[-40%] h-44 w-44 bg-[#c9a13b]/20" aria-hidden />
              <div className="relative">
                <h3 className="text-lg font-black">پرسش های خود را از جراح بپرسید</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  اگر سوال جراحی دارید که پاسخ آن را در مقالات پیدا نکردید، از طریق
                  واتسپ یا تماس تلفنی با مطب در میان بگذارید: {SITE.phoneDisplay}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
