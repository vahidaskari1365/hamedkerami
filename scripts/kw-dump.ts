import { ARTICLE_KEYWORDS } from "../src/lib/seo-keywords";
import { BLOG_ARTICLES } from "../src/lib/blog-articles";

/* استخراج متن‌های فعلی برای طراحی فیکس‌ها */
for (const [slug, kwStr] of Object.entries(ARTICLE_KEYWORDS)) {
  const art = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!art) continue;
  const focus = kwStr.split(",")[0].trim();
  const paras = art.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const firstPara = paras.filter((p) => !p.startsWith(">"))[0] ?? "";
  const h2s = [...art.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
  console.log(`\n████ ${slug} — کانونی: «${focus}»`);
  console.log(`TITLE: ${art.title}`);
  console.log(`EXCERPT: ${art.excerpt}`);
  console.log(`FIRST-PARA-ENDS: ...${firstPara.slice(-90)}`);
  console.log(`H2s: ${h2s.join(" ⟩ ")}`);
}
