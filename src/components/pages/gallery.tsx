"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/cinematic";
import { MasonryGrid, masonryAspect } from "@/components/masonry";
import { PageHero } from "@/components/pages/about";
import { BeforeAfter } from "@/components/before-after";
import { LandingVideos } from "@/components/landing/landing-videos";
import { SITE_VIDEOS, APARAT_CHANNEL } from "@/lib/videos";
import { useContent } from "@/lib/content-context";

export function GalleryPage() {
  const {
    beforeAfter: BEFORE_AFTER,
    galleryCats: GALLERY_CATS,
    galleryCases: GALLERY_CASES,
    portfolioCovers: PORTFOLIO_COVERS,
    videos: VIDEOS,
  } = useContent();
  const [cat, setCat] = useState("همه");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cases = cat === "همه" ? GALLERY_CASES : GALLERY_CASES.filter((c) => c.cat === cat);

  return (
    <>
      <PageHero
        crumb="گالری"
        eyebrow="گالری"
        title="نمونه جراحی ها، قبل و بعد و فضای کلینیک"
        desc="گالری جراحی های فک (ارتوسرجری) و بازسازی فک و کاشت دندان (ایمپلنت) — انجام درمان موفق منوط به تجربیات آکادمیک و میدانی مناسب، پایداری به اصول علمی و فارغ از توجه به زوایای مالی می باشد."
      />

      {/* before-after sliders */}
      <section className="bg-white py-20" aria-label="مقایسه قبل و بعد">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mb-12">
            <h2 className="text-2xl font-black sm:text-3xl">قبل و بعد جراحی</h2>
            <p className="mt-3 text-sm text-foreground/60">
              دستگیره وسط تصویر را به طرفین بکشید.
            </p>
          </Reveal>
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <BeforeAfter
                before={BEFORE_AFTER.bimax.before}
                after={BEFORE_AFTER.bimax.after}
                label={BEFORE_AFTER.bimax.label}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <BeforeAfter
                before={BEFORE_AFTER.blepharo.before}
                after={BEFORE_AFTER.blepharo.after}
                label={BEFORE_AFTER.blepharo.label}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* portfolio covers — کاور نمونه کارها */}
      <section className="bg-white py-20" aria-label="کاور نمونه کارها">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black sm:text-3xl">کاور نمونه کارها</h2>
              <p className="mt-3 text-sm leading-7 text-foreground/60">
                مجموعه کاور نتایج جراحی های ارتوگناتیک فک و صورت (قبل و بعد) — از استوری های
                اینستاگرام دکتر کرمانی.
              </p>
            </div>
            <a
              href="https://www.instagram.com/dr.hamedkermani.omfs/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ink px-6 py-3 text-xs font-bold text-white transition hover:bg-teal"
            >
              مشاهده اینستاگرام
            </a>
          </Reveal>

          {/* چیدمان Pinterest — آبشاری با ارتفاع‌های متنوع */}
          <MasonryGrid className="mt-12" cols="columns-2 sm:columns-3 lg:columns-5" gap="gap-3 sm:gap-4">
            {PORTFOLIO_COVERS.map((c, i) => (
              <Reveal key={c.src} delay={(i % 5) * 0.05}>
                <figure
                  tabIndex={0}
                  aria-label={`${c.title} — برای نمایش بزرگ کلیک کنید`}
                  className={`group relative ${masonryAspect(i)} cursor-zoom-in overflow-hidden rounded-xl bg-bone-2 shadow-md ring-1 ring-ink/10 transition-shadow hover:shadow-xl hover:ring-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal`}
                  onClick={() => setLightbox(c.src)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLightbox(c.src);
                    }
                  }}
                >
                  <Image
                    src={c.src}
                    alt={`${c.title} — نمونه کار جراحی فک و صورت دکتر کرمانی`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-0 right-0 left-0 p-3 text-[11px] font-extrabold leading-5 text-white">
                    {c.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </MasonryGrid>
        </div>
      </section>

      {/* filterable grid */}
      <section className="bg-white py-20" aria-label="نمونه ها">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-black sm:text-3xl">گالری نمونه ها</h2>
          </Reveal>
          <div className="thin-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
            {GALLERY_CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  cat === c
                    ? "bg-ink text-white shadow-lg"
                    : "bg-white text-foreground/70 ring-1 ring-ink/10 hover:ring-teal/40"
                }`}
                aria-pressed={cat === c}
              >
                {c}
              </button>
            ))}
          </div>

          <MasonryGrid className="mt-10">
            <AnimatePresence mode="popLayout">
              {cases.map((c, i) => (
                <motion.figure
                  key={c.src}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative ${masonryAspect(i + 2)} cursor-zoom-in overflow-hidden rounded-2xl bg-bone-2`}
                  onClick={() => setLightbox(c.src)}
                >
                  <Image
                    src={c.src}
                    alt={`${c.title} — ${c.cat}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                    className="object-cover object-top transition-transform duration-[1.1s] ease-out group-hover:scale-108"
                  />
                  <span className="sweep-hover" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <figcaption className="absolute bottom-0 right-0 left-0 p-5 text-white">
                    <p className="text-[11px] font-bold text-teal">{c.cat}</p>
                    <p className="mt-1 text-sm font-extrabold">{c.title}</p>
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </MasonryGrid>
        </div>
      </section>

      {/* videos — گرید ویدیوهای واقعی آپارات (پخش با کلیک) */}
      <section className="bg-white py-20" aria-label="فیلم های جراحی">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-black sm:text-3xl">فیلم های جراحی</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground/60">
              {VIDEOS.note} — تصاویر واقعی اتاق عمل و نتیجه بیماران؛ برای پخش روی هر ویدیو کلیک کنید.
            </p>
          </Reveal>
          <Reveal className="mt-10 text-right">
            <LandingVideos videos={SITE_VIDEOS} />
          </Reveal>
          <a
            href={VIDEOS.aparat || APARAT_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-bold text-white transition hover:bg-ink-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
            مشاهده کانال آپارات
          </a>
        </div>
      </section>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="نمایش تصویر بزرگ"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl"
            >
              <Image
                src={lightbox}
                alt="نمایش کامل تصویر گالری"
                width={1400}
                height={1600}
                className="mx-auto max-h-[80vh] w-auto max-w-full object-contain"
                priority
              />
            </motion.div>
            <button
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition hover:bg-white/20"
              onClick={() => setLightbox(null)}
              aria-label="بستن"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
