import { SITE_VIDEOS, videosForPage, INTRO_VIDEO } from "@/lib/videos";
import { SITE } from "@/lib/data";

/* ============================================================
   /video-sitemap.xml — سایت‌مپ ویدیو (استاندارد Google sitemap-video 1.1)
   صفحه‌های میزبان ویدیو + متادیتای کامل هر ویدیو (thumbnail لوکال،
   player_loc/content_loc آپارات، مدت، تاریخ انتشار) → شانس نتیجه
   ویدیویی گوگل و فهرست‌شدن در Video Search. معرفی در robots.txt.
   ============================================================ */

export const dynamic = "force-static";
export const revalidate = 86400;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function secondsFromIso(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 60;
  return (Number(m[1] || 0) * 60 + Number(m[2] || 0)) || 60;
}

/** صفحه‌های میزبان ویدیوها — هوم + لندینگ‌ها + درباره */
function hostPages(): { path: string; videos: typeof SITE_VIDEOS }[] {
  const pages: { path: string; videos: typeof SITE_VIDEOS }[] = [
    { path: "/jaw-surgery", videos: videosForPage("jaw-surgery") },
    { path: "/chin-surgery", videos: videosForPage("chin-surgery") },
    { path: "/dental-implant", videos: videosForPage("dental-implant") },
    { path: "/implant-pasdaran", videos: videosForPage("implant-pasdaran") },
    { path: "/best-jaw-surgeon-tehran", videos: videosForPage("best-jaw-surgeon-tehran") },
    { path: "/about", videos: [INTRO_VIDEO] },
  ];
  /* هوم‌پیج: سه ویدیوی شاخص */
  const highlights = ["p77oq71", "X04Y6", "40hon"]
    .map((id) => SITE_VIDEOS.find((v) => v.id === id))
    .filter(Boolean) as typeof SITE_VIDEOS;
  pages.unshift({ path: "/", videos: highlights });
  return pages.filter((p) => p.videos.length > 0);
}

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${hostPages()
  .map(
    ({ path, videos }) => `  <url>
    <loc>${SITE.url}${path}</loc>
${videos
  .map(
    (v) => `    <video:video>
      <video:thumbnail_loc>${SITE.url}${v.thumb}</video:thumbnail_loc>
      <video:title>${esc(v.title)}</video:title>
      <video:description>${esc(v.description)}</video:description>
      <video:player_loc>${esc(v.embed)}</video:player_loc>
      <video:content_loc>${esc(v.embed)}</video:content_loc>
      <video:duration>${secondsFromIso(v.durationIso)}</video:duration>
      <video:publication_date>${v.upload}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`,
  )
  .join("\n")}
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
