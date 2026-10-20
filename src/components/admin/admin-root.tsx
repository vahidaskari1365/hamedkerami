"use client";

/* ============================================================
   AdminRoot — پنل مدیریت سایت (مسیر #/admin)
   دروازه‌ی ورود + چیدمان سایدباری وردپرسی + مسیریابی داخلی
   ============================================================ */

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, Link } from "@/components/hash-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_NAV, ENTITY_CONFIGS } from "@/components/admin/entity-configs";
import { EntityPage } from "@/components/admin/entity-page";
import { Dashboard } from "@/components/admin/dashboard";
import { SettingsPage } from "@/components/admin/settings-page";
import { MessagesPage } from "@/components/admin/messages-page";
import { AppointmentsPage } from "@/components/admin/appointments-page";
import { CommentsPage } from "@/components/admin/comments-page";
import { LandingPagesPage, LandingEditor } from "@/components/admin/landing-pages";
import { MediaPage } from "@/components/admin/media-page";
import {
  Award,
  BadgeDollarSign,
  BarChart3,
  Clock,
  ExternalLink,
  FlipHorizontal2,
  Globe,
  GraduationCap,
  HelpCircle,
  Images,
  LayoutDashboard,
  Loader2,
  LogIn,
  Mail,
  Menu,
  Newspaper,
  Orbit,
  ImagePlus,
  Settings,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  X,
  CalendarClock,
  MessagesSquare,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  Stethoscope,
  BadgeDollarSign,
  Orbit,
  Images,
  FlipHorizontal2,
  Newspaper,
  GraduationCap,
  Award,
  Users,
  BarChart3,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Clock,
  Mail,
  Settings,
  Globe,
  ImagePlus,
  CalendarClock,
  MessagesSquare,
};

const PAGE_TITLES: Record<string, string> = {
  "/admin": "داشبورد",
};

/* ---------------- صفحه ورود ---------------- */
function LoginScreen({ onOk }: { onOk: () => void }) {
  const { toast } = useToast();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        onOk();
      } else {
        setError(data.error || "خطا");
      }
    } catch {
      setError("خطای ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/15 ring-1 ring-teal/30">
            <Image src="/images/logo.png" alt="لوگو" width={40} height={40} className="rounded-lg" />
          </div>
          <h1 className="text-lg font-black text-white">پنل مدیریت دکتر حامد کرمانی</h1>
          <p className="mt-1 text-xs text-white/40">برای ورود، اطلاعات حساب مدیر را وارد کنید</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
          <div>
            <Label htmlFor="adm-user">نام کاربری</Label>
            <Input id="adm-user" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5" dir="ltr" autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="adm-pass">رمز عبور</Label>
            <Input id="adm-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" dir="ltr" autoComplete="current-password" />
          </div>
          {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full gap-2" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            ورود به پنل
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- چیدمان پنل ---------------- */
function AdminLayout({ username, children }: { username: string; children: React.ReactNode }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const title =
    PAGE_TITLES[path] ??
    (path.startsWith("/admin/landing/")
      ? "ویرایش صفحه فرود"
      : null) ??
    ADMIN_NAV.flatMap((g) => g.items).find((i) => i.path === path)?.label ??
    "پنل مدیریت";

  const nav = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {ADMIN_NAV.map((group, gi) => (
        <div key={gi}>
          {group.group ? (
            <p className="px-3 pb-1.5 pt-4 text-[10px] font-black tracking-wide text-white/30">
              {group.group}
            </p>
          ) : gi > 0 ? (
            <div className="my-2 h-px bg-white/10" />
          ) : null}
          {group.items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = path === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-teal text-white shadow-lg shadow-teal/25"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-bone">
      {/* سایدبار دسکتاپ */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 flex-col bg-ink lg:flex">
        <div className="flex items-center gap-2.5 p-4 pb-3">
          <Image src="/images/logo.png" alt="لوگو" width={34} height={34} className="rounded-lg" />
          <div>
            <p className="text-sm font-black text-white">پنل مدیریت</p>
            <p className="text-[10px] text-white/40">دکتر حامد کرمانی</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <Link
          href="/"
          className="m-3 flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink size={14} />
          مشاهده سایت
        </Link>
      </aside>

      {/* سایدبار موبایل */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 right-0 w-72 bg-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-black text-white">پنل مدیریت</p>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10" aria-label="بستن منو">
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-3.5rem)] overflow-y-auto">{nav}</div>
          </aside>
        </div>
      ) : null}

      {/* محتوای اصلی */}
      <div className="flex min-h-screen flex-1 flex-col lg:mr-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/10 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-foreground/60 hover:bg-bone lg:hidden"
              aria-label="باز کردن منو"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-sm font-black">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-foreground/50 sm:inline">مدیر: {username}</span>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/">
                <ExternalLink size={13} />
                سایت
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ---------------- ریشه‌ی ادمین ---------------- */
export function AdminRoot() {
  const path = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("admin");

  useEffect(() => {
    /* فقط بررسی نشست فعلی — ساخت حساب ادمین فقط سمت سرور (seed) انجام می‌شود */
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d.ok) {
          setUsername(d.username);
          setAuthed(true);
        } else setAuthed(false);
      })
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="animate-spin text-teal" size={32} />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onOk={() => setAuthed(true)} />;
  }

  const sub = path.replace(/^\/admin\/?/, "");
  let content: React.ReactNode;
  if (!sub) {
    content = <Dashboard />;
  } else if (sub === "settings") {
    content = <SettingsPage />;
  } else if (sub === "messages") {
    content = <MessagesPage />;
  } else if (sub === "appointments") {
    content = <AppointmentsPage />;
  } else if (sub === "comments") {
    content = <CommentsPage />;
  } else if (sub === "media") {
    content = <MediaPage />;
  } else if (sub === "landing") {
    content = <LandingPagesPage />;
  } else if (sub.startsWith("landing/")) {
    const slug = sub.slice("landing/".length);
    content = <LandingEditor key={slug} slug={slug} />;
  } else if (ENTITY_CONFIGS[sub]) {
    content = <EntityPage key={sub} config={ENTITY_CONFIGS[sub]} />;
  } else {
    content = (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
        صفحه پیدا نشد
      </div>
    );
  }

  return <AdminLayout username={username}>{content}</AdminLayout>;
}
