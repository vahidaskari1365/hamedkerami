"use client";

import { useState } from "react";
import type { SiteVideo } from "@/lib/videos";

/* ============================================================
   کارت ویدیوی آپارات — پخش تنبل (فقط با کلیک iframe بارگذاری می‌شود؛
   سرعت صفحه و LCP حفظ می‌شود) — هم‌سبک کارت‌های صفحه فرود
   ============================================================ */

function VideoCard({ v }: { v: SiteVideo }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5">
      {play ? (
        <iframe
          src={v.embed}
          title={v.title}
          className="aspect-video w-full"
          allowFullScreen
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="group relative block aspect-video w-full overflow-hidden bg-bone-2"
          aria-label={`پخش ویدیو: ${v.title}`}
        >
          <img
            src={v.thumb}
            alt={v.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" aria-hidden />
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white" dir="ltr">
            {v.duration}
          </span>
          <span className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/95 text-white shadow-lg transition group-hover:scale-110" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
          </span>
        </button>
      )}
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
