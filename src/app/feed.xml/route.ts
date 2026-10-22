import { getPublishedPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/data";

/* ============================================================
   /feed.xml — فید RSS 2.0 (GEO/AIO: کشف محتوای جدید توسط AI و
   خواننده‌ها؛ پیشنهاد geo-optimizer-skill). مقالات جدید که
   ایجنت‌ها منتشر می‌کنند خودکار اینجا ظاهر می‌شوند.
   ============================================================ */

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .slice(0, 30)
    .map((p) => {
      const link = `${SITE.url}/blog/${p.slug}`;
      const pub = p.publishedAt ? new Date(p.publishedAt).toUTCString() : "";
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      ${pub ? `<pubDate>${pub}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} | ${escapeXml(SITE.titleLong)}</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>مقالات تخصصی جراحی فک و صورت، ایمپلنت دندان و زیبایی — ${escapeXml(SITE.name)}</description>
    <language>fa-ir</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
