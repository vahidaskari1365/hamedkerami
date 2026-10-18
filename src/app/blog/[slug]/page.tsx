import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-chrome";
import { ArticleBody } from "@/components/article-body";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { LandingCtaBand } from "@/components/landing/landing-chrome";
import { getBlogPost, getPublishedPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  const url = `${SITE.url}/blog/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
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

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    image: `${SITE.url}${post.cover || "/images/og-cover.jpg"}`,
    inLanguage: "fa-IR",
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    author: {
      "@type": "Person",
      name: "دکتر حامد کرمانی",
      url: SITE.url,
      jobTitle: "متخصص جراحی فک و صورت",
      "@id": `${SITE.url}/#physician`,
    },
    publisher: { "@id": `${SITE.url}/#physician` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: "جراحی فک و صورت",
  };

  return (
    <SiteShell>
      <JsonLdScript data={articleLd} />
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
              {post.date}
            </span>
            <span>نویسنده: دکتر حامد کرمانی — متخصص جراحی فک و صورت</span>
          </div>
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

      {/* بدنه مقاله */}
      <article className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ArticleBody body={post.body} />

          {/* باکس نویسنده — E-E-A-T */}
          <div className="mt-12 flex items-start gap-4 rounded-2xl bg-bone p-6">
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
                تهران — بیش از ۱۰۶۷ جراحی موفق فک و صورت و ۵۰۰۰ ایمپلنت دندان.
              </p>
              <Link
                href="/about"
                className="mt-2 inline-block text-xs font-bold text-teal-3 transition hover:opacity-80"
              >
                مشاهده رزومه کامل →
              </Link>
            </div>
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
