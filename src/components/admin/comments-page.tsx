"use client";

/* ---------- نظرات مقاله‌ها — بازبینی در پنل ----------
   نظر جدید همیشه «در انتظار تأیید» است؛ فقط تأییدشده‌ها
   زیر مقاله در سایت نمایش داده می‌شوند */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageSquare, MessagesSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cmt {
  id: string;
  slug: string;
  name: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

const FILTERS = [
  { key: "", label: "همه" },
  { key: "pending", label: "در انتظار تأیید" },
  { key: "approved", label: "تأییدشده" },
];

export function CommentsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Cmt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Cmt | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      setRows(data.ok ? data.rows : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(c: Cmt, approved: boolean) {
    const res = await fetch(`/api/admin/comments/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    const data = await res.json();
    if (data.ok) {
      toast({ title: approved ? "نظر تأیید و منتشر شد" : "نظر به حالت انتظار برگشت" });
      setOpen(null);
      load();
    } else {
      toast({ title: data.error || "خطا", variant: "destructive" });
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast({ title: "نظر حذف شد" });
      setOpen(null);
      load();
    }
  }

  const shown = useMemo(
    () =>
      filter
        ? rows.filter((r) => (filter === "approved" ? r.approved : !r.approved))
        : rows,
    [rows, filter],
  );
  const pendingCount = rows.filter((r) => !r.approved).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black">نظرات مقاله‌ها</h1>
        <p className="mt-1 text-xs text-foreground/50">
          {rows.length.toLocaleString("fa-IR")} نظر
          {pendingCount > 0 ? ` — ${pendingCount.toLocaleString("fa-IR")} نظر در انتظار تأیید` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count = f.key
            ? rows.filter((r) => (f.key === "approved" ? r.approved : !r.approved)).length
            : rows.length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === f.key
                  ? "bg-ink text-white shadow"
                  : "bg-bone text-foreground/60 hover:text-foreground"
              }`}
            >
              {f.label} {count > 0 ? `(${count.toLocaleString("fa-IR")})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
          نظری با این وضعیت وجود ندارد
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpen(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(c);
              }}
              className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 text-right shadow-sm transition hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  c.approved ? "bg-teal/10 text-teal" : "bg-amber-100 text-amber-700"
                }`}
              >
                <MessageSquare size={16} />
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold">
                  {c.name}
                  <Badge variant="secondary" className="text-[10px]" dir="ltr">
                    {c.slug}
                  </Badge>
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-foreground/50">{c.body}</p>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {c.approved ? "منتشرشده" : "در انتظار"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* جزئیات نظر */}
      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{open.name}</h3>
                <a
                  href={`/blog/${open.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-teal-3 hover:underline"
                  dir="ltr"
                >
                  /blog/{open.slug}
                  <ExternalLink size={11} />
                </a>
              </div>
              <MessagesSquare size={18} className="text-teal" />
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-bone p-4 text-sm leading-7">
              {open.body}
            </p>
            <p className="mt-3 text-[11px] text-foreground/40">
              {new Date(open.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {open.approved ? (
                <Button variant="outline" size="sm" onClick={() => setApproved(open, false)}>
                  لغو انتشار
                </Button>
              ) : (
                <Button size="sm" onClick={() => setApproved(open, true)}>
                  تأیید و انتشار
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-red-600 hover:bg-red-50"
                onClick={() => remove(open.id)}
              >
                <Trash2 size={14} />
                حذف
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
