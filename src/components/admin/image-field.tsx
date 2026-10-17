"use client";

/* ---------- فیلد تصویر: آپلود + کتابخانه + ورود دستی URL ---------- */

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Library, X } from "lucide-react";

export function ImageField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<{ url: string; name: string }[]>([]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        onChange(data.url);
      } else {
        alert(data.error || "خطای آپلود");
      }
    } catch {
      alert("خطای آپلود");
    } finally {
      setUploading(false);
    }
  }

  async function openLibrary() {
    setLibraryOpen(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok)
        setLibrary([...(data.uploads ?? []), ...(data.site ?? [])]);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-bold text-foreground/80">{label}</p> : null}
      <div className="flex items-start gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-bone">
          {value ? (
            <>
              <Image src={value} alt="پیش‌نمایش" fill sizes="96px" className="object-cover" unoptimized={value.startsWith("/uploads/")} />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute left-1 top-1 rounded-full bg-ink/80 p-1 text-white transition hover:bg-red-600"
                aria-label="حذف تصویر"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground/30">
              <Upload size={20} />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              <Upload size={14} />
              {uploading ? "در حال آپلود…" : "آپلود عکس"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={openLibrary} className="gap-1.5">
              <Library size={14} />
              کتابخانه
            </Button>
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/... یا /uploads/..."
            className="h-9 text-xs"
            dir="ltr"
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[70vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>کتابخانه تصاویر</DialogTitle>
          </DialogHeader>
          {library.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground/50">
              هنوز تصویری آپلود نشده است
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {library.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10 transition hover:ring-2 hover:ring-teal"
                  onClick={() => {
                    onChange(img.url);
                    setLibraryOpen(false);
                  }}
                >
                  <Image src={img.url} alt={img.name} fill sizes="120px" className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
