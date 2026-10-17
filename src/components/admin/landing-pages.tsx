"use client";

/* ============================================================
   صفحات فرود سئو در پنل ادمین
   LandingPagesPage — فهرست ۴ صفحه + وضعیت
   LandingEditor    — ویرایش کامل: سئو، هیرو، بخش‌ها، FAQ، CTA
   ============================================================ */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/hash-router";
import { useToast } from "@/hooks/use-toast";
import { ImageField } from "@/components/admin/image-field";
import { refreshSiteContent } from "@/lib/content-context";
import type { LandingData, LandingSectionData } from "@/lib/landing-defaults";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/** خطوط «عنوان | توضیح» → آرایه کارت */
const linesToPairs = (lines: string[]) =>
  lines
    .map((l) => {
      const idx = l.indexOf("|");
      if (idx === -1) return { title: l.trim(), desc: "" };
      return { title: l.slice(0, idx).trim(), desc: l.slice(idx + 1).trim() };
    })
    .filter((p) => p.title);

/** خطوط «مسیر | عنوان» → لینک‌های فوتر */
const linesToLinks = (lines: string[]) =>
  lines
    .map((l) => {
      const idx = l.indexOf("|");
      if (idx === -1) return { href: l.trim(), label: l.trim() };
      return { href: l.slice(0, idx).trim(), label: l.slice(idx + 1).trim() };
    })
    .filter((p) => p.href);

const pairsToLines = (
  pairs: ({ title: string; desc: string } | { href: string; label: string })[]
) =>
  pairs.map((p) =>
    "title" in p ? `${p.title} | ${p.desc}` : `${p.href} | ${p.label}`
  );

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-bold text-foreground/80">
      <span>{children}</span>
      {hint ? <span className="text-[10px] font-normal text-foreground/40">{hint}</span> : null}
    </label>
  );
}

/* ---------------- فهرست صفحات ---------------- */
interface LandingRow {
  slug: string;
  label: string;
  metaTitle: string;
  published: boolean;
  updatedAt: string | null;
  source: string;
}

export function LandingPagesPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<LandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/landing");
      const data = await res.json();
      setRows(data.ok ? data.items : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/landing")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setRows(d?.ok ? d.items : []);
      })
      .catch(() => {
        if (alive) setRows([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function toggle(row: LandingRow) {
    // برای تغییر وضعیت انتشار باید صفحه کامل را بگیریم و فقط published را عوض کنیم
    try {
      const res = await fetch(`/api/admin/landing/${row.slug}`);
      const data = await res.json();
      if (!data.ok) throw new Error();
      await fetch(`/api/admin/landing/${row.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data.page, published: !row.published }),
      });
      await load();
      toast({ title: row.published ? "صفحه غیرفعال شد (۴۰۴)" : "صفحه فعال شد" });
    } catch {
      toast({ title: "خطا در تغییر وضعیت", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black">صفحات فرود سئو</h1>
        <p className="mt-1 text-xs text-foreground/50">
          چهار صفحه‌ی اصلی سئوی سایت — متن‌ها، تصاویر، سوالات و دکمه‌های هر صفحه از اینجا ویرایش می‌شود
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div
              key={row.slug}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                <Globe size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{row.label}</p>
                <p className="mt-0.5 truncate text-xs text-foreground/50" dir="auto">
                  /{row.slug} — {row.metaTitle}
                </p>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {row.source === "db" ? "ویرایش شده" : "پیش‌فرض"}
              </Badge>
              <Switch checked={row.published} onCheckedChange={() => toggle(row)} aria-label="انتشار" />
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label="مشاهده">
                <a href={`/${row.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                </a>
              </Button>
              <Button asChild className="gap-1.5" size="sm">
                <Link href={`/admin/landing/${row.slug}`}>
                  <Pencil size={13} />
                  ویرایش
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- ادیتور صفحه فرود ---------------- */
export function LandingEditor({ slug }: { slug: string }) {
  const { toast } = useToast();
  const [form, setForm] = useState<LandingData | null>(null);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/landing/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          const p = d.page;
          setForm({
            slug: p.slug,
            label: p.label ?? "",
            metaTitle: p.metaTitle ?? "",
            metaDescription: p.metaDescription ?? "",
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            eyebrow: p.eyebrow ?? "",
            h1: p.h1 ?? "",
            heroDesc: p.heroDesc ?? "",
            heroImage: p.heroImage ?? "",
            heroImageAlt: p.heroImageAlt ?? "",
            sections: Array.isArray(p.sections) ? p.sections : [],
            ctaTitle: p.ctaTitle ?? "",
            ctaDesc: p.ctaDesc ?? "",
            faqs: Array.isArray(p.faqs) ? p.faqs : [],
            related: Array.isArray(p.related) ? p.related : [],
          });
          setPublished(Boolean(p.published));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !form) {
    return <div className="h-40 animate-pulse rounded-2xl bg-bone" />;
  }

  const set = <K extends keyof LandingData>(key: K, value: LandingData[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setSection = (i: number, patch: Partial<LandingSectionData>) =>
    setForm((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
      return { ...prev, sections };
    });

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/landing/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "صفحه ذخیره شد — در سایت اعمال شد" });
        refreshSiteContent();
      } else {
        toast({ title: data.error || "خطا", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطای ارتباط با سرور", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black">
            <Globe size={20} className="text-teal" />
            ویرایش «{form.label}»
          </h1>
          <p className="mt-1 text-xs text-foreground/50">
            /{slug} — تغییرات پس از ذخیره بلافاصله در سایت اعمال می‌شود
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-foreground/60">
            انتشار در سایت
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              aria-label="انتشار در سایت"
            />
          </label>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            ذخیره صفحه
          </Button>
        </div>
      </div>

      {/* سئو */}
      <Card title="سئو و متا">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>نام نمایشی (در پنل)</FieldLabel>
            <Input value={form.label} onChange={(e) => set("label", e.target.value)} />
          </div>
          <div>
            <FieldLabel hint="حدود ۶۰ حرف">عنوان متا (Title)</FieldLabel>
            <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="حدود ۱۵۵ حرف">توضیحات متا (Description)</FieldLabel>
            <Textarea
              rows={3}
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="هر خط یک کلمه کلیدی">کلمات کلیدی</FieldLabel>
            <Textarea
              rows={4}
              value={form.keywords.join("\n")}
              onChange={(e) => set("keywords", e.target.value.split("\n"))}
            />
          </div>
        </div>
      </Card>

      {/* هیرو */}
      <Card title="بخش هیرو (بالای صفحه)">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>برچسب بالای عنوان</FieldLabel>
            <Input value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
          </div>
          <div>
            <FieldLabel>متن جایگزین تصویر (Alt)</FieldLabel>
            <Input value={form.heroImageAlt} onChange={(e) => set("heroImageAlt", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="مهم‌ترین تیتر سئو">تیتر اصلی (H1)</FieldLabel>
            <Textarea rows={2} value={form.h1} onChange={(e) => set("h1", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>توضیح هیرو</FieldLabel>
            <Textarea rows={3} value={form.heroDesc} onChange={(e) => set("heroDesc", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <ImageField
              label="تصویر هیرو (پس‌زمینه بالای صفحه)"
              value={form.heroImage}
              onChange={(v) => set("heroImage", v)}
            />
          </div>
        </div>
      </Card>

      {/* بخش‌ها */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black">بخش‌های محتوایی صفحه ({form.sections.length})</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              set("sections", [...form.sections, { title: "بخش جدید", paragraphs: ["متن بخش…"] }])
            }
          >
            <Plus size={14} />
            افزودن بخش
          </Button>
        </div>

        {form.sections.map((s, i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">
                {i + 1}
              </span>
              <Input
                value={s.title}
                onChange={(e) => setSection(i, { title: e.target.value })}
                placeholder="عنوان بخش (H2)"
                className="flex-1 font-black"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => set("sections", move(form.sections, i, -1))}
                aria-label="بالا"
              >
                <ArrowUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => set("sections", move(form.sections, i, 1))}
                aria-label="پایین"
              >
                <ArrowDown size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50"
                onClick={() => set("sections", form.sections.filter((_, idx) => idx !== i))}
                aria-label="حذف بخش"
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid gap-4">
              <div>
                <FieldLabel hint="هر خط یک پاراگراف — **متن** بولد می‌شود">پاراگراف‌ها</FieldLabel>
                <Textarea
                  rows={4}
                  value={(s.paragraphs ?? []).join("\n")}
                  onChange={(e) => setSection(i, { paragraphs: e.target.value.split("\n") })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel hint="هر خط: عنوان | توضیح">کارت‌ها</FieldLabel>
                  <Textarea
                    rows={4}
                    value={pairsToLines(s.cards ?? []).join("\n")}
                    onChange={(e) => setSection(i, { cards: linesToPairs(e.target.value.split("\n")) })}
                    placeholder="عنوان کارت | توضیح کارت"
                  />
                </div>
                <div>
                  <FieldLabel hint="هر خط یک مرحله">مراحل درمان</FieldLabel>
                  <Textarea
                    rows={4}
                    value={(s.steps ?? []).join("\n")}
                    onChange={(e) => setSection(i, { steps: e.target.value.split("\n") })}
                    placeholder="مرحله اول…"
                  />
                </div>
              </div>
              <div>
                <FieldLabel hint="هر خط یک مورد">بولت‌پوینت‌ها</FieldLabel>
                <Textarea
                  rows={3}
                  value={(s.bullets ?? []).join("\n")}
                  onChange={(e) => setSection(i, { bullets: e.target.value.split("\n") })}
                  placeholder="ویژگی اول…"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* سوالات متداول */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black">سوالات متداول ({form.faqs.length})</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => set("faqs", [...form.faqs, { q: "سوال جدید؟", a: "پاسخ…" }])}
          >
            <Plus size={14} />
            افزودن سوال
          </Button>
        </div>
        {form.faqs.map((f, i) => (
          <div key={i} className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr]">
            <div className="flex flex-row gap-1 sm:flex-col">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => set("faqs", move(form.faqs, i, -1))} aria-label="بالا">
                <ArrowUp size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => set("faqs", move(form.faqs, i, 1))} aria-label="پایین">
                <ArrowDown size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50"
                onClick={() => set("faqs", form.faqs.filter((_, idx) => idx !== i))}
                aria-label="حذف"
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid gap-3">
              <Input
                value={f.q}
                onChange={(e) =>
                  set("faqs", form.faqs.map((x, idx) => (idx === i ? { ...x, q: e.target.value } : x)))
                }
                placeholder="سوال"
                className="font-bold"
              />
              <Textarea
                rows={2}
                value={f.a}
                onChange={(e) =>
                  set("faqs", form.faqs.map((x, idx) => (idx === i ? { ...x, a: e.target.value } : x)))
                }
                placeholder="پاسخ"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA و لینک‌ها */}
      <Card title="دکمه‌ی مشاوره (CTA) و لینک‌های مرتبط">
        <div className="grid gap-4">
          <div>
            <FieldLabel>تیتر CTA</FieldLabel>
            <Input value={form.ctaTitle} onChange={(e) => set("ctaTitle", e.target.value)} />
          </div>
          <div>
            <FieldLabel>توضیح CTA</FieldLabel>
            <Textarea rows={2} value={form.ctaDesc} onChange={(e) => set("ctaDesc", e.target.value)} />
          </div>
          <div>
            <FieldLabel hint="هر خط: مسیر | عنوان">لینک‌های مرتبط در فوتر</FieldLabel>
            <Textarea
              rows={3}
              value={pairsToLines(form.related).join("\n")}
              onChange={(e) => set("related", linesToLinks(e.target.value.split("\n")))}
              placeholder="/jaw-surgery | جراحی فک"
            />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-1.5 shadow-lg">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          ذخیره صفحه
        </Button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-black">{title}</h2>
      {children}
    </div>
  );
}
