"use client";

import type { SiteVideo } from "@/lib/videos";

/* ============================================================
   کارت ویدیوی آپارات — iframe واقعی در HTML اولیه (SSR) + loading lazy.
   ⚠️ قبلاً پلیر فقط با کلیک رندر می‌شد (facade)؛ گوگل در اعتبارسنجی
   گزارش «ویدیو» سرچ کنسول پلیر را در صفحه پیدا نمی‌کرد و خطای
   «Video not detected on page / Affected pages were found» می‌داد.
   حالا iframe در خروجی سرور هست و Googlebot بدون کلیک آن را می‌بیند؛
   loading="lazy" هم یعنی embed فقط وقتی نزدیک viewport است لود می‌شود
   و LCP و سرعت صفحه حفظ می‌شود.
   ============================================================ */

function VideoCard({ v }: { v: SiteVideo }) {
  return (
    <figure className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5">
      <iframe
        src={v.embed}
        title={v.title}
        className="aspect-video w-full"
        loading="lazy"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      />
      <figcaption className="p-5">
        <p className="text-sm font-black text-ink">{v.title}</p>
        <p className="mt-2 text-xs leading-7 text-foreground/60">{v.description}</p>
      </figcaption>
    </figure>
  );
}

export function LandingVideos({ videos, cols = 3 }: { videos: SiteVideo[]; cols?: 2 | 3 }) {
  if (!videos.length) return null;
  return (
    <div className={`mt-8 grid gap-5 ${cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
      {videos.map((v) => (
        <VideoCard key={v.id} v={v} />
      ))}
    </div>
  );
}
