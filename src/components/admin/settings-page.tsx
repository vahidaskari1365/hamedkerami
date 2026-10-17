"use client";

/* ============================================================
   تنظیمات ادمین — متن‌های ثابت سایت (تلفن، آدرس، هیرو، درباره)
   + تغییر رمز عبور مدیر
   ============================================================ */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { refreshSiteContent } from "@/lib/content-context";
import { ImageField } from "@/components/admin/image-field";
import { Save, KeyRound, LogOut } from "lucide-react";

type Group = Record<string, unknown>;

interface FieldSpec {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "lines";
}

const GROUPS: { key: string; title: string; fields: FieldSpec[] }[] = [
  {
    key: "brand",
    title: "برند و لوگو",
    fields: [
      { key: "logoImage", label: "لوگوی سایت (نوبار، فوتر و صفحات فرود)", type: "image" },
    ],
  },
  {
    key: "site",
    title: "اطلاعات تماس و برند",
    fields: [
      { key: "name", label: "نام سایت" },
      { key: "title", label: "عنوان کوتاه" },
      { key: "titleLong", label: "عنوان بلند", type: "textarea" },
      { key: "metaDescription", label: "توضیحات متا (سئو)", type: "textarea" },
      { key: "phone", label: "تلفن (جهت لینک تماس)" },
      { key: "phoneDisplay", label: "تلفن (نمایش)" },
      { key: "whatsapp", label: "واتسپ (لینک)" },
      { key: "whatsappDisplay", label: "واتسپ (نمایش)" },
      { key: "instagram", label: "اینستاگرام (لینک)" },
      { key: "aparat", label: "آپارات (لینک)" },
      { key: "maps", label: "نقشه (لینک)" },
      { key: "address", label: "آدرس کامل", type: "textarea" },
      { key: "addressShort", label: "آدرس کوتاه" },
    ],
  },
  {
    key: "hero",
    title: "بخش هیرو صفحه اصلی",
    fields: [
      { key: "eyebrow", label: "برچسب بالای عنوان" },
      { key: "name", label: "نام دکتر" },
      { key: "headline", label: "تیتر اصلی (هر خط یک بخش)", type: "lines" },
      { key: "sub", label: "زیرتیتر", type: "textarea" },
      { key: "quote", label: "نقل قول", type: "textarea" },
      { key: "image", label: "تصویر دکتر", type: "image" },
      { key: "clinicImage", label: "تصویر کلینیک (پس‌زمینه)", type: "image" },
    ],
  },
  {
    key: "about",
    title: "متن‌های درباره دکتر",
    fields: [
      { key: "intro", label: "معرفی", type: "textarea" },
      { key: "academic", label: "سوابق آکادمیک", type: "textarea" },
      { key: "school", label: "تحصیلات ابتدایی" },
      { key: "scholar", label: "گوگل اسکولار" },
    ],
  },
  {
    key: "videos",
    title: "فیلم‌ها",
    fields: [
      { key: "aparat", label: "لینک کانال آپارات" },
      { key: "note", label: "یادداشت" },
    ],
  },
];

function GroupField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (spec.type === "image") {
    return (
      <div className="sm:col-span-2">
        <ImageField label={spec.label} value={typeof value === "string" ? value : ""} onChange={onChange} />
      </div>
    );
  }
  if (spec.type === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-bold text-foreground/80">{spec.label}</label>
        <Textarea rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (spec.type === "lines") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-bold text-foreground/80">{spec.label}</label>
        <Textarea rows={2} value={arr.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} />
      </div>
    );
  }
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-foreground/80">{spec.label}</label>
      <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, Group>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setSettings(d.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveGroup(key: string) {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: settings[key] }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "ذخیره شد — سایت به‌روز شد" });
        refreshSiteContent();
      } else {
        toast({ title: data.error || "خطا", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطای ارتباط", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) {
      toast({ title: "تکرار رمز مطابقت ندارد", variant: "destructive" });
      return;
    }
    if (pw.next.length < 8 || !/\p{L}/u.test(pw.next) || !/\p{N}/u.test(pw.next)) {
      toast({
        title: "رمز جدید کافی قوی نیست",
        description: "حداقل ۸ حرف و شامل حرف و عدد باشد",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: pw.current, next: pw.next }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "رمز عبور تغییر کرد" });
        setPw({ current: "", next: "", confirm: "" });
      } else {
        toast({ title: data.error || "خطا", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطای ارتباط", variant: "destructive" });
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.hash = "#/admin";
    window.location.reload();
  }

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-bone" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black">تنظیمات و متن‌های ثابت</h1>
        <p className="mt-1 text-xs text-foreground/50">
          تلفن‌ها، آدرس، متن‌های هیرو و درباره‌ی دکتر
        </p>
      </div>

      {GROUPS.map((g) => (
        <div key={g.key} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black">{g.title}</h2>
            <Button size="sm" onClick={() => saveGroup(g.key)} disabled={savingKey === g.key} className="gap-1.5">
              <Save size={14} />
              {savingKey === g.key ? "…" : "ذخیره"}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <GroupField
                key={f.key}
                spec={f}
                value={settings[g.key]?.[f.key]}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    [g.key]: { ...(prev[g.key] ?? {}), [f.key]: v },
                  }))
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* تغییر رمز */}
      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black">
          <KeyRound size={16} className="text-teal" />
          تغییر رمز عبور مدیر
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground/80">رمز فعلی</label>
            <Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground/80">رمز جدید</label>
            <Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground/80">تکرار رمز جدید</label>
            <Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} dir="ltr" />
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={logout} className="gap-1.5">
            <LogOut size={14} />
            خروج از پنل
          </Button>
          <Button onClick={changePassword}>تغییر رمز</Button>
        </div>
      </div>
    </div>
  );
}
