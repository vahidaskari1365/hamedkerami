"use client";

/* ---------- نظرات خوانندگان زیر مقاله ----------
   فقط نظرهای تأییدشده (از پنل ادمین) نمایش داده می‌شوند؛
   نظر جدید با وضعیت «در انتظار تأیید» ذخیره می‌شود */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquare, MessageSquarePlus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Cmt {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

function faTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ArticleComments({ slug }: { slug: string }) {
  const [rows, setRows] = useState<Cmt[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setRows(data.ok ? data.rows : []);
    } catch {
      setRows([]);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("نام خود را وارد کنید");
    if (body.trim().length < 5) return setError("متن نظر خیلی کوتاه است");
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: name.trim(), body: body.trim(), website: honeypot }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
        setOpen(false);
        setName("");
        setBody("");
      } else {
        setError(data.error || "ارسال نظر انجام نشد");
      }
    } catch {
      setError("خطای ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10" aria-label="نظرات خوانندگان">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-black text-ink">
          <MessageSquare size={18} className="text-teal-3" />
          نظرات خوانندگان
          {rows && rows.length > 0 ? (
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-black text-teal-3">
              {rows.length.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </h2>
        {!sent ? (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen((o) => !o)}>
            <MessageSquarePlus size={14} />
            ثبت نظر
          </Button>
        ) : null}
      </div>

      {/* فرم ثبت نظر */}
      {open && !sent ? (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="mt-4 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`c-name-${slug}`}>نام شما *</Label>
              <Input
                id={`c-name-${slug}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="mt-1.5"
                placeholder="نام و نام خانوادگی"
                required
              />
            </div>
            <div className="flex items-end">
              <p className="text-[11px] leading-5 text-foreground/45">
                نظر شما پس از بازبینی و تأیید مدیر سایت منتشر می‌شود.
              </p>
            </div>
          </div>
          {/* تله ربات — مخفی */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <div>
            <Label htmlFor={`c-body-${slug}`}>متن نظر *</Label>
            <textarea
              id={`c-body-${slug}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={4}
              className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="پرسش، تجربه یا توضیح خود را بنویسید…"
              required
            />
          </div>
          {error ? <p className="text-xs font-bold text-red-600" role="alert">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquarePlus size={14} />}
              ارسال نظر
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </div>
        </motion.form>
      ) : null}

      {/* پیام موفقیت */}
      {sent ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-teal/8 px-4 py-3 text-xs font-bold text-ink ring-1 ring-teal/20">
          <CheckCircle2 size={15} className="shrink-0 text-teal-3" />
          نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود — سپاس از همراهی شما.
        </p>
      ) : null}

      {/* فهرست نظرها */}
      {rows === null ? (
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/60" aria-hidden />
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-6 text-center text-xs text-foreground/45">
          هنوز نظری ثبت نشده — اولین نفر باشید.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/8">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-black text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10 text-teal-3">
                    <Quote size={13} />
                  </span>
                  {c.name}
                </p>
                <span className="text-[10.5px] text-foreground/40">{faTime(c.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-7 text-foreground/75">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
