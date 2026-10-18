"use client";

/* ============================================================
   کتابخانه رسانه — همه تصاویر آپلودشده و تصاویر سایت
   کپی آدرس برای استفاده در بلاگ/بخش‌ها + حذف آپلودها
   ============================================================ */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, FolderOpen, Loader2, Trash2, Upload } from "lucide-react";

interface MediaItem {
  url: string;
  name: string;
  dir: string;
}

export function MediaPage() {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<MediaItem[]>([]);
  const [site, setSite] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"uploads" | "site">("uploads");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) {
        setUploads(data.uploads ?? []);
        setSite(data.site ?? []);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok) {
          setUploads(d.uploads ?? []);
          setSite(d.site ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
      toast({ title: "آدرس کپی شد", description: url });
    } catch {
      toast({ title: "کپی ممکن نشد", variant: "destructive" });
    }
  }

  async function remove(item: MediaItem) {
    try {
      const res = await fetch(`/api/admin/upload?url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "تصویر حذف شد" });
        setDeleting(null);
        await load();
      } else {
        toast({ title: data.error || "خطا", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطای ارتباط", variant: "destructive" });
    }
  }

  const list = (tab === "uploads" ? uploads : site).filter(
    (m) => !query || m.name.includes(query) || m.url.includes(query)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">کتابخانه رسانه</h1>
          <p className="mt-1 text-xs text-foreground/50">
            همه تصاویر سایت — آدرس هر عکس را کپی کنید و در بلاگ یا هر بخش دیگر استفاده کنید
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <Loader2 size={13} className={loading ? "animate-spin" : "hidden"} />
          بازخوانی
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-bone p-1">
          <button
            onClick={() => setTab("uploads")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              tab === "uploads" ? "bg-white shadow-sm" : "text-foreground/50"
            }`}
          >
            <Upload size={13} />
            آپلود شده‌ها ({uploads.length})
          </button>
          <button
            onClick={() => setTab("site")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              tab === "site" ? "bg-white shadow-sm" : "text-foreground/50"
            }`}
          >
            <FolderOpen size={13} />
            تصاویر سایت ({site.length})
          </button>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو بر اساس نام…"
          className="h-9 max-w-xs"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
          {tab === "uploads"
            ? "هنوز تصویری آپلود نشده — از فیلد «تصویر» هر بخش می‌توانید آپلود کنید"
            : "تصویری پیدا نشد"}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {list.map((m) => (
            <div
              key={m.url}
              className="group overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-bone">
                <Image
                  src={m.url}
                  alt={m.name}
                  fill
                  sizes="(max-width:640px) 50vw, 160px"
                  className="object-cover"
                  unoptimized={m.url.startsWith("/uploads/")}
                />
                <button
                  onClick={() => copy(m.url)}
                  className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100"
                  aria-label="کپی آدرس"
                >
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink">
                    {copied === m.url ? "کپی شد" : "کپی آدرس"}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <p className="truncate text-[10px] text-foreground/50" dir="ltr" title={m.name}>
                  {m.name}
                </p>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    onClick={() => copy(m.url)}
                    className="rounded p-1 text-foreground/40 transition hover:bg-bone hover:text-teal"
                    aria-label="کپی"
                  >
                    {copied === m.url ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  {tab === "uploads" ? (
                    <button
                      onClick={() => setDeleting(m)}
                      className="rounded p-1 text-foreground/40 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="حذف"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setDeleting(null)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-black">حذف تصویر؟</h3>
            <p className="mt-2 text-xs text-foreground/60" dir="ltr">
              {deleting.url}
            </p>
            <p className="mt-2 text-xs text-foreground/60">
              اگر این تصویر در جایی از سایت در حال استفاده باشد، از آنجا حذف خواهد شد.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
                انصراف
              </Button>
              <Button variant="destructive" size="sm" onClick={() => remove(deleting)}>
                حذف کن
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
