"use client";

/* ---------- پیام‌های فرم تماس ---------- */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Msg {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string | null;
  createdAt: string;
}

export function MessagesPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMsg, setOpenMsg] = useState<Msg | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
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

  async function remove(id: string) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast({ title: "پیام حذف شد" });
      setOpenMsg(null);
      load();
    }
  }

  function faTime(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black">پیام‌های تماس</h1>
        <p className="mt-1 text-xs text-foreground/50">
          پیام‌های ارسالی از فرم تماس سایت — {rows.length.toLocaleString("fa-IR")} پیام
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
          هنوز پیامی دریافت نشده است
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map((m) => (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenMsg(m)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenMsg(m);
              }}
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 text-right shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">{m.name}</p>
                <p className="mt-0.5 truncate text-xs text-foreground/50">{m.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {faTime(m.createdAt)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(m.id);
                  }}
                  aria-label="حذف پیام"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openMsg ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpenMsg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{openMsg.name}</h3>
                <p className="mt-1 text-xs text-foreground/50" dir="ltr">
                  {openMsg.email}
                </p>
              </div>
              <MailOpen size={18} className="text-teal" />
            </div>
            <p className="mt-4 text-sm font-bold">{openMsg.subject}</p>
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-bone p-4 text-sm leading-7">
              {openMsg.message || "—"}
            </p>
            <p className="mt-3 text-[11px] text-foreground/40">{faTime(openMsg.createdAt)}</p>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${openMsg.email}`} dir="ltr">
                  پاسخ با ایمیل
                </a>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => remove(openMsg.id)} className="gap-1.5">
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
