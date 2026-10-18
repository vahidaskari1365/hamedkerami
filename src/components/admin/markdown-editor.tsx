"use client";

/* ============================================================
   MarkdownEditor — ویرایشگر متن بلاگ
   تولبار: تیتر، بولد، لیست، نقل‌قول (جعبه پاسخ کوتاه)، لینک
   + دکمه‌ی درج تصویر (آپلود → ![توضیح](آدرس)) + پیش‌نمایش زنده
   ============================================================ */

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Loader2,
  PencilLine,
  Quote,
} from "lucide-react";

function insertAtCursor(
  value: string,
  s: number,
  e: number,
  before: string,
  after = ""
): { next: string; caret: number } {
  const selected = value.slice(s, e);
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  return { next, caret: s + before.length + selected.length + after.length };
}

function prefixLine(value: string, s: number, prefix: string): { next: string; caret: number } {
  const lineStart = value.lastIndexOf("\n", Math.max(0, s - 1)) + 1;
  const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  return { next, caret: s + prefix.length };
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 16,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  function apply(mode: "h2" | "h3" | "bold" | "ul" | "ol" | "quote" | "link") {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart ?? value.length;
    const e = ta.selectionEnd ?? value.length;
    let r: { next: string; caret: number };
    switch (mode) {
      case "h2":
        r = prefixLine(value, s, "\n## ");
        break;
      case "h3":
        r = prefixLine(value, s, "\n### ");
        break;
      case "bold":
        r = insertAtCursor(value, s, e, "**", "**");
        break;
      case "ul":
        r = prefixLine(value, s, "\n- ");
        break;
      case "ol":
        r = prefixLine(value, s, "\n1. ");
        break;
      case "quote":
        r = prefixLine(value, s, "\n> ");
        break;
      case "link":
        r = insertAtCursor(value, s, e, "[", "](https://)");
        break;
    }
    onChange(r.next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = r.caret;
    });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        const ta = taRef.current;
        const s = ta?.selectionStart ?? value.length;
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        const r = insertAtCursor(value, s, ta?.selectionEnd ?? s, `\n![${alt}](${data.url})\n`);
        onChange(r.next);
        requestAnimationFrame(() => taRef.current?.focus());
      } else {
        alert(data.error || "خطای آپلود");
      }
    } catch {
      alert("خطای آپلود");
    } finally {
      setUploading(false);
    }
  }

  const TOOLS: { mode: Parameters<typeof apply>[0]; icon: React.ReactNode; label: string }[] = [
    { mode: "h2", icon: <Heading2 size={15} />, label: "تیتر بزرگ" },
    { mode: "h3", icon: <Heading3 size={15} />, label: "تیتر کوچک" },
    { mode: "bold", icon: <Bold size={15} />, label: "بولد" },
    { mode: "ul", icon: <List size={15} />, label: "لیست" },
    { mode: "ol", icon: <ListOrdered size={15} />, label: "لیست شماره‌دار" },
    { mode: "quote", icon: <Quote size={15} />, label: "جعبه «پاسخ کوتاه»" },
    { mode: "link", icon: <Link2 size={15} />, label: "لینک" },
  ];

  return (
    <div className="rounded-xl border border-ink/15 bg-white">
      {/* تولبار */}
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 p-2">
        {TOOLS.map((t) => (
          <button
            key={t.mode}
            type="button"
            onClick={() => apply(t.mode)}
            title={t.label}
            aria-label={t.label}
            className="rounded-lg p-2 text-foreground/60 transition hover:bg-bone hover:text-ink"
          >
            {t.icon}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-ink/10" aria-hidden />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="درج تصویر در متن"
          aria-label="درج تصویر در متن"
          className="flex items-center gap-1.5 rounded-lg bg-teal/10 p-2 text-xs font-bold text-teal transition hover:bg-teal/20 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={15} />}
          {uploading ? "در حال آپلود…" : "درج عکس در متن"}
        </button>
        <span className="flex-1" aria-hidden />
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`flex items-center gap-1.5 rounded-lg p-2 text-xs font-bold transition ${
            preview ? "bg-ink text-white" : "text-foreground/60 hover:bg-bone"
          }`}
        >
          {preview ? <PencilLine size={14} /> : <Eye size={14} />}
          {preview ? "ادامه ویرایش" : "پیش‌نمایش"}
        </button>
      </div>

      {preview ? (
        <div
          className="max-h-[60vh] min-h-40 overflow-y-auto p-5 text-[15px] leading-9 [&_blockquote]:rounded-xl [&_blockquote]:bg-teal/10 [&_blockquote]:border-r-4 [&_blockquote]:border-teal [&_blockquote]:p-4 [&_blockquote]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-black [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-extrabold [&_img]:my-4 [&_img]:rounded-xl [&_li]:mr-5 [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-teal [&_a]:underline"
          dir="rtl"
        >
          <ReactMarkdown>{value || "*متنی برای نمایش وجود ندارد*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y rounded-b-xl p-4 text-[15px] leading-8 outline-none placeholder:text-foreground/30"
          dir="rtl"
        />
      )}

      <p className="border-t border-ink/5 px-4 py-2 text-[11px] text-foreground/40">
        راهنما: <b>## عنوان</b> برای تیتر — <b>**متن**</b> برای بولد — <b>&gt; متن</b> برای جعبه پاسخ کوتاه — عکس‌ها با دکمه‌ی «درج عکس» اضافه می‌شوند
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadImage(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
