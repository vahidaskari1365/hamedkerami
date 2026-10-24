"use client";

/* ============================================================
   EntityPage — ادیتور عمومی CRUD برای همه‌ی موجودیت‌ها
   لیست + فرم ایجاد/ویرایش + حذف + نمایش/مخفی + ترتیب
   ============================================================ */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { refreshSiteContent } from "@/lib/content-context";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { EntityConfig, FieldDef } from "@/components/admin/entity-configs";

type Row = Record<string, unknown>;

const BADGE_LABELS: Record<string, string> = {
  jaw: "جراحی فک",
  implant: "ایمپلنت",
  main: "صفحه اصلی",
  bimax: "بایمکس",
  blepharo: "بلفاروپلاستی",
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case "text":
    case "number":
      return (
        <Input
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) =>
            onChange(field.type === "number" ? e.target.value.replace(/[^\d-]/g, "") : e.target.value)
          }
          placeholder={field.placeholder}
          inputMode={field.type === "number" ? "numeric" : undefined}
        />
      );
    case "textarea":
      return (
        <Textarea
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={5}
        />
      );
    case "lines": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Textarea
          value={arr.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          placeholder={field.placeholder}
          rows={4}
        />
      );
    }
    case "image":
      return (
        <ImageField
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
        />
      );
    case "markdown":
      return (
        <MarkdownEditor
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          placeholder={field.placeholder}
        />
      );
    case "bool":
      return <Switch checked={Boolean(value)} onCheckedChange={onChange} />;
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return null;
  }
}

export function EntityPage({ config }: { config: EntityConfig }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const load = useCallback(async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/${config.slug}`);
      const data = await res.json();
      setRows(data.ok ? data.rows : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [config.slug]);

  useEffect(() => {
    /* میکروتسک — بدون setState همگام در بدنه effect (react-compiler) */
    queueMicrotask(() => void load(false));
  }, [load]);

  const openNew = () => {
    const init: Row = {};
    for (const f of config.fields) {
      init[f.key] =
        f.type === "bool"
          ? f.key === "published"
          : f.type === "number"
            ? f.key === "order"
              ? rows.length
              : 0
            : f.type === "select"
              ? (f.options?.[0]?.value ?? "")
              : "";
    }
    setForm(init);
    setEditing("new");
  };

  const openEdit = (row: Row) => {
    const init: Row = {};
    for (const f of config.fields) init[f.key] = row[f.key];
    setForm(init);
    setEditing(row);
  };

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = editing === "new";
      const url = isNew ? `/api/admin/${config.slug}` : `/api/admin/${config.slug}/${(editing as Row).id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: isNew ? `${config.singular} اضافه شد` : "ذخیره شد" });
        setEditing(null);
        await load();
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

  async function remove(row: Row) {
    try {
      const res = await fetch(`/api/admin/${config.slug}/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "حذف شد" });
        setDeleting(null);
        await load();
        refreshSiteContent();
      } else {
        toast({ title: data.error || "خطا", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطای ارتباط", variant: "destructive" });
    }
  }

  async function togglePublished(row: Row) {
    const key = config.publishedKey!;
    try {
      await fetch(`/api/admin/${config.slug}/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !row[key] }),
      });
      await load();
      refreshSiteContent();
    } catch {
      /* noop */
    }
  }

  const cols = useMemo(
    () => `grid-cols-[auto_1fr_auto] ${config.hasOrder ? "sm:grid-cols-[auto_1fr_5rem_auto]" : ""}`,
    [config.hasOrder]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">{config.title}</h1>
          <p className="mt-1 text-xs text-foreground/50">
            {rows.length} مورد — تغییرات بلافاصله در سایت اعمال می‌شود
          </p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus size={16} />
          افزودن {config.singular}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
          موردی ثبت نشده — با دکمه‌ی «افزودن {config.singular}» شروع کنید
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div
              key={String(row.id)}
              className={`grid ${cols} items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 shadow-sm transition hover:shadow-md`}
            >
              {config.imageKey ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bone">
                  {row[config.imageKey] ? (
                    <Image
                      src={String(row[config.imageKey])}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized={String(row[config.imageKey]).startsWith("/uploads/")}
                    />
                  ) : (
                    <div className="h-full w-full bg-bone" />
                  )}
                </div>
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-lg bg-bone" />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">
                  {String(row[config.titleKey] || "—")}
                </p>
                {config.subtitleKey && row[config.subtitleKey] ? (
                  <p className="mt-0.5 truncate text-xs text-foreground/50" dir="auto">
                    {String(row[config.subtitleKey])}
                  </p>
                ) : null}
              </div>

              {config.hasOrder ? (
                <div className="hidden text-center text-xs font-bold text-foreground/40 sm:block">
                  {String(row.order ?? 0)}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-1.5">
                {config.badgeKey && row[config.badgeKey] ? (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {BADGE_LABELS[String(row[config.badgeKey])] ?? String(row[config.badgeKey])}
                  </Badge>
                ) : null}
                {config.publishedKey ? (
                  <Switch
                    checked={Boolean(row[config.publishedKey])}
                    onCheckedChange={() => togglePublished(row)}
                    aria-label="نمایش در سایت"
                  />
                ) : null}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} aria-label="ویرایش">
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleting(row)}
                  aria-label="حذف"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* فرم ایجاد / ویرایش */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent aria-describedby={undefined} className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? `افزودن ${config.singular}` : `ویرایش ${config.singular}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                {f.type !== "image" ? (
                  <label className="mb-1.5 block text-sm font-bold text-foreground/80">
                    {f.label}
                  </label>
                ) : null}
                <FieldInput
                  field={f}
                  value={form[f.key]}
                  onChange={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              انصراف
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* تأیید حذف */}
      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف {config.singular}؟</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground/60">
            «{deleting ? String(deleting[config.titleKey] || "") : ""}» برای همیشه حذف می‌شود.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={() => deleting && remove(deleting)}>
              حذف کن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
