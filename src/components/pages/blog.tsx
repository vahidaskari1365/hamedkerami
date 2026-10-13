"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { useContent } from "@/lib/content-context";

export function BlogPage() {
  const { site: SITE, blogPosts: BLOG_POSTS } = useContent();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const open = BLOG_POSTS.find((p) => p.slug === openSlug);

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
                <article className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-xl hover:shadow-teal/10">
                  <div className="flex items-center gap-3 text-xs text-foreground/50">
                    <span className="rounded-full bg-teal/10 px-3 py-1 font-bold text-teal-3">
                      {p.date}
                    </span>
                    <span>توسط تیم مجموعه</span>
                  </div>
                  <h2 className="mt-4 text-xl font-black leading-8">{p.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-8 text-foreground/65">
                    {p.excerpt}
                  </p>
                  <button
                    onClick={() => setOpenSlug(p.slug)}
                    className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-teal-3 transition hover:gap-3"
                    aria-label={`ادامه مطلب: ${p.title}`}
                  >
                    ادامه مطلب
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <path d="M19 12H5m6-6l-6 6 6 6" />
                    </svg>
                  </button>
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

      {/* article modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm sm:p-10"
            onClick={() => setOpenSlug(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
          >
            <motion.article
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-auto max-w-3xl rounded-3xl bg-white p-8 sm:p-12"
            >
              <button
                className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink transition hover:bg-ink/10"
                onClick={() => setOpenSlug(null)}
                aria-label="بستن مقاله"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <span className="rounded-full bg-teal/10 px-4 py-1.5 text-xs font-bold text-teal-3">
                {open.date}
              </span>
              <h2 className="mt-5 text-2xl font-black leading-9 sm:text-3xl">{open.title}</h2>
              <p className="mt-6 text-base leading-9 text-foreground/75">{open.body}</p>
              <div className="mt-10 rounded-2xl bg-bone p-6">
                <p className="text-sm font-bold">دکتر حامد کرمانی</p>
                <p className="mt-1 text-xs leading-6 text-foreground/60">
                  متخصص جراحی فک و صورت — فلوشیپ جراحی های کرانیوفیشال
                </p>
                <a
                  href={`tel:${SITE.phone}`}
                  className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-xs font-bold text-white transition hover:bg-ink-3"
                >
                  رزرو مشاوره: {SITE.phoneDisplay}
                </a>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
