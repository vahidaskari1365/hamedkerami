import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-chrome";
import { ArticleBody } from "@/components/article-body";
import {
  ArticleToc,
  ArticleTocMobile,
  BackToTop,
  ReadingProgress,
} from "@/components/article-reader";
import { ArticleComments } from "@/components/article-comments";
import { KeywordTags } from "@/components/keyword-tags";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { LandingCtaBand } from "@/components/landing/landing-chrome";
import { getBlogPost, getPublishedPosts } from "@/lib/blog-posts";
import { parseArticle } from "@/lib/article-extras";
import { keywordsForSlug } from "@/lib/seo-keywords";
import { db } from "@/lib/db";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/* عنوان SERP — AEO/SXO: گوگل به‌جای شمار کاراکتر، عرض پیکسلی (~۶۰۰px)
   را می‌بَرد که برای فارسی تقریباً ۶۰ تا ۶۵ کاراکتر است. عنوان کامل در
   H1 و og:title می‌ماند؛ فقط <title> هوشمند کوتاه می‌شود — برش فقط در
   مرز طبیعی عبارت («؛» «،» «+» «—» «–») و هرگز با «…»: عنوان نیمه‌تمام
   با سه‌نقطه در نتایج گوگل ظاهر broken می‌شود و CTR را می‌کُشد.
   بودجه کل ≤۶۵ کاراکتر شامل برند. */
const TITLE_BRAND = " | دکتر حامد کرمانی";
const TITLE_BODY_BUDGET = 46; /* ۶۵ منهای طول برند */

/* حذف حروف ربط و نقطه‌گذاری انتهایی تا عنوان با «و» یا «،» تمام نشود */
function cleanTitleEnd(s: string): string {
  let out = s.trimEnd();
  const connectives = [" و", " یا", " با", " در", " برای", " به", " از", " که", " تا", " های"];
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of connectives) {
      if (out.endsWith(c)) { out = out.slice(0, -c.length).trimEnd(); changed = true; }
    }
  }
  return out.replace(/[؛،+—–|-]+$/, "").trimEnd();
}

function serpTitle(full: string): string {
  if (full.length <= TITLE_BODY_BUDGET) return full + TITLE_BRAND;
  const head = full.slice(0, TITLE_BODY_BUDGET + 1);
  /* ۱) بلندترین پیشوندی که درست قبل از یک مرز طبیعی تمام می‌شود */
  let core = "";
  for (let i = head.length - 1; i >= 22; i--) {
    if ("؛،+—–".includes(head[i - 1])) {
      core = cleanTitleEnd(head.slice(0, i - 1));
      if (core.length >= 20) break;
      core = "";
    }
  }
  /* ۲) نبود مرز طبیعی؟ برش کلمه‌ای با پاک‌سازی انتهای عنوان */
  if (!core) {
    const spaceAt = head.lastIndexOf(" ");
    core = cleanTitleEnd(head.slice(0, spaceAt > 20 ? spaceAt : TITLE_BODY_BUDGET));
  }
  return core + TITLE_BRAND;
}

/* توضیح متا — استاندارد: ۱۲۰–۱۶۰ کاراکتر با برش کلمه‌ای (نه وسط کلمه) */
function serpDescription(full: string): string {
  if (full.length <= 160) return full;
  const cut = full.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  const url = `${SITE.url}/blog/${slug}`;
  return {
    title: { absolute: serpTitle(post.title) },
    description: serpDescription(post.excerpt),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      images: [
        {
          url: post.cover || "/images/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover || "/images/og-cover.jpg"],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);
  const url = `${SITE.url}/blog/${slug}`;

  /* تحلیل ساختاری — AEO/GEO/SXO */
  const extras = parseArticle(post.body);

  /* شمارش بازدید واقعی (PageView) — خطا نادیده گرفته می‌شود */
  let views = 0;
  try {
    views = await db.pageView.count({ where: { path: `/blog/${slug}` } });
  } catch {
    /* دیتابیس در دسترس نیست — شمارش نمایش داده نمی‌شود */
  }

  const authorEntity = {
    "@type": "Person",
    name: "دکتر حامد کرمانی",
    url: SITE.url,
    jobTitle: "متخصص جراحی فک و صورت",
    description:
      "متخصص جراحی فک و صورت و فلوشیپ جراحی های کرانیوفاسیال از دانشگاه علوم پزشکی تهران",
    "@id": `${SITE.url}/#physician`,
  };

  /* گراف کامل — BlogPosting + MedicalWebPage + FAQPage (AEO) */
  const articleGraph = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.excerpt,
      ...(extras.answer ? { alternativeHeadline: extras.answer.slice(0, 160) } : {}),
      image: `${SITE.url}${post.cover || "/images/og-cover.jpg"}`,
      inLanguage: "fa-IR",
      wordCount: extras.wordCount,
      timeRequired: `PT${extras.readMinutes}M`,
      /* کلمات کلیدی هدف مقاله — SEO/GEO: entity روشن برای گوگل و
         مدل‌های زبانی (ChatGPT/Perplexity) — منبع: keyword-plan */
      keywords: keywordsForSlug(slug),
      /* Speakable — GEO/AEO: بخش‌های قابل نقل‌قول صوتی/متنی برای
         دستیارهای هوشمند (پاسخ کوتاه + عنوان) */
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-answer]"],
      },
      datePublished: post.publishedAt ?? undefined,
      dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
      author: authorEntity,
      publisher: { "@id": `${SITE.url}/#physician` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      about: "جراحی فک و صورت",
      ...(extras.faq.length
        ? { mainEntity: { "@id": `${url}#faq` } }
        : {}),
    },
    {
      "@type": "MedicalWebPage",
      "@id": `${url}#webpage`,
      url,
      name: post.title,
      description: post.excerpt,
      inLanguage: "fa-IR",
      specialty: "https://schema.org/OralAndMaxillofacialSurgery",
      about: { "@id": `${url}#article` },
      lastReviewed: post.updatedAt ?? post.publishedAt ?? undefined,
      reviewedBy: { "@id": `${SITE.url}/#physician` },
      author: { "@id": `${SITE.url}/#physician` },
    },
    ...(extras.faq.length
      ? [
          {
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: extras.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <SiteShell>
      <ReadingProgress />
      <BackToTop />
      <JsonLdScript data={{ "@context": "https://schema.org", "@graph": articleGraph }} />
      <JsonLdScript
        data={breadcrumbLd([
          { name: "وبلاگ", path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ])}
      />

      {/* هدر مقاله — نان‌ریز (Breadcrumb) + عنوان h1 + متا */}
      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition hover:text-teal">خانه</Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="transition hover:text-teal">وبلاگ</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">{post.title}</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.5] sm:text-4xl sm:leading-[1.5]">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
            <span className="rounded-full bg-teal/15 px-4 py-1.5 font-bold text-teal">
              جراحی فک و صورت
            </span>
            <span className="rounded-full bg-white/10 px-4 py-1.5">زمان مطالعه: {extras.readMinutes} دقیقه</span>
            {views > 0 ? (
              <span className="rounded-full bg-white/10 px-4 py-1.5">
                {views.toLocaleString("fa-IR")} بازدید
              </span>
            ) : null}
            <span>نویسنده: دکتر حامد کرمانی — متخصص جراحی فک و صورت</span>
          </div>
          {/* خلاصه عنوان‌ها — دید اولیه به ساختار مقاله (SXO) */}
          {extras.toc.length ? (
            <p className="mt-4 text-xs leading-6 text-white/45">
              در این مقاله بخوانید: {extras.toc.map((t) => t.title).join(" • ")}
            </p>
          ) : null}
        </div>
      </header>

      {/* تصویر شاخص */}
      {post.cover ? (
        <div className="mx-auto -mt-8 max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-ink/10">
            <Image
              src={post.cover}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {/* بدنه مقاله + فهرست مطالب چسبان (SXO) */}
      <article className="bg-bone py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          {/* فهرست مطالب — فقط دسکتاپ بزرگ، با هایلایت بخش فعال */}
          {extras.toc.length > 2 ? (
            <aside className="hidden xl:block" aria-label="فهرست مطالب">
              <ArticleToc items={extras.toc} />
            </aside>
          ) : null}

          <div className="mx-auto w-full min-w-0 max-w-3xl">
            <ArticleTocMobile items={extras.toc} />
            <ArticleBody sections={extras.sections} />

            {/* برچسب‌های کلیدواژه — نسخه مرئی BlogPosting.keywords
               (هم‌راستایی محتوای مرئی با اسکیما — SEO/AEO) */}
            <KeywordTags keywords={keywordsForSlug(slug)} />

            {/* باکس نویسنده — E-E-A-T */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/6">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-teal/30">
                <Image
                  src="/images/clinic/dr-portrait.jpg"
                  alt="دکتر حامد کرمانی"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-black text-ink">دکتر حامد کرمانی</p>
                <p className="mt-1 text-xs leading-6 text-foreground/60">
                  متخصص جراحی فک و صورت و فلوشیپ جراحی های کرانیوفاسیال از دانشگاه علوم پزشکی
                  تهران — بیش از ۱۲۰۰ جراحی موفق فک و صورت و ۲۰۰۰۰ ایمپلنت دندان.
                </p>
                <Link
                  href="/about"
                  className="mt-2 inline-block text-xs font-bold text-teal-3 transition hover:opacity-80"
                >
                  مشاهده رزومه کامل →
                </Link>
              </div>
            </div>

            {/* نظرات خوانندگان — SXO + سیگنال تعامل */}
            <ArticleComments slug={slug} />
          </div>
        </div>
      </article>

      {/* CTA — SXO: تبدیل خواننده به بیمار */}
      <LandingCtaBand
        title="مشاوره تخصصی با دکتر حامد کرمانی"
        desc="تشخیص دقیق تنها پس از معاینه و تصویربرداری امکان‌پذیر است. برای رزرو نوبت یا ارسال رادیوگرافی در واتسپ با مطب در تماس باشید."
      />

      {/* مقالات مرتبط — لینک‌سازی داخلی */}
      {related.length ? (
        <section className="bg-bone py-16" aria-label="مقالات مرتبط">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-black text-ink sm:text-2xl">مقالات مرتبط</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-xl hover:shadow-teal/10"
                >
                  {r.cover ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/5">
                      <Image
                        src={r.cover}
                        alt={r.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-sm font-black leading-7 text-ink group-hover:text-teal-3">
                      {r.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-foreground/60">
                      {r.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
