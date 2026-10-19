import { getPublishedPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/data";

/* ============================================================
   /llms-full.txt — متن کامل مقالات برای مدل‌های زبانی (AIO/GEO)
   داینامیک از دیتابیس — همیشه همگام با مقالات منتشرشده.
   ============================================================ */

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPublishedPosts();
  const body = `# دکتر حامد کرمانی — متن کامل مقالات
# ${SITE.url} — متخصص جراحی فک و صورت، فلوشیپ کرانیوفاسیال

${posts
  .map(
    (p) => `---

## ${p.title}
آدرس: ${SITE.url}/blog/${p.slug}
تاریخ: ${p.date} — نویسنده: دکتر حامد کرمانی

${p.body}`,
  )
  .join("\n\n")}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
