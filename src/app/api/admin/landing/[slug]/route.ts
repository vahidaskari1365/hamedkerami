import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { LANDING_DEFAULTS, type LandingData, type LandingSectionData } from "@/lib/landing-defaults";

/* ============================================================
   خواندن / ویرایش یک صفحه فرود — فقط ادمین
   ============================================================ */

type Ctx = { params: Promise<{ slug: string }> };

const S = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max) : "";
/** اگر ورودی رشته‌ی JSON بود پارس می‌کند، آرایه‌ی معتبر برمی‌گرداند */
const asArray = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
const LINES = (v: unknown, maxItems: number, maxLen: number): string[] =>
  asArray(v)
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((x) => x.slice(0, maxLen));

function sanitizeSections(v: unknown): LandingSectionData[] {
  return asArray(v).slice(0, 12).map((raw) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const out: LandingSectionData = { title: S(s.title, 200) };
    if (Array.isArray(s.paragraphs))
      out.paragraphs = LINES(s.paragraphs, 12, 2500);
    if (Array.isArray(s.cards))
      out.cards = asArray(s.cards).slice(0, 12).map((c) => {
        const o = (c ?? {}) as Record<string, unknown>;
        return { title: S(o.title, 150), desc: S(o.desc, 600) };
      });
    if (Array.isArray(s.steps)) out.steps = LINES(s.steps, 12, 600);
    if (Array.isArray(s.bullets)) out.bullets = LINES(s.bullets, 12, 600);
    return out;
  });
}

function sanitizeFaqs(v: unknown): { q: string; a: string }[] {
  return asArray(v)
    .slice(0, 20)
    .map((f) => {
      const o = (f ?? {}) as Record<string, unknown>;
      return { q: S(o.q, 300), a: S(o.a, 2000) };
    })
    .filter((f) => f.q);
}

function sanitizeRelated(v: unknown): { href: string; label: string }[] {
  return asArray(v)
    .slice(0, 10)
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return { href: S(o.href, 200), label: S(o.label, 150) };
    })
    .filter((r) => r.href);
}

function sanitizeBody(body: Record<string, unknown>) {
  return {
    label: S(body.label, 100) || "صفحه فرود",
    metaTitle: S(body.metaTitle, 200),
    metaDescription: S(body.metaDescription, 400),
    keywords: JSON.stringify(LINES(body.keywords, 20, 80)),
    eyebrow: S(body.eyebrow, 150),
    h1: S(body.h1, 300),
    heroDesc: S(body.heroDesc, 1200),
    heroImage: S(body.heroImage, 300),
    heroImageAlt: S(body.heroImageAlt, 200),
    sections: JSON.stringify(sanitizeSections(body.sections)),
    ctaTitle: S(body.ctaTitle, 250),
    ctaDesc: S(body.ctaDesc, 800),
    faqs: JSON.stringify(sanitizeFaqs(body.faqs)),
    related: JSON.stringify(sanitizeRelated(body.related)),
    published: Boolean(body.published),
  };
}

const parse = <T,>(raw: string, fb: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fb;
  }
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  try {
    const row = await db.landingPage.findUnique({ where: { slug } });
    if (row) {
      return NextResponse.json({
        ok: true,
        page: {
          ...row,
          keywords: parse<string[]>(row.keywords, []),
          sections: parse<LandingSectionData[]>(row.sections, []),
          faqs: parse<{ q: string; a: string }[]>(row.faqs, []),
          related: parse<{ href: string; label: string }[]>(row.related, []),
          source: "db",
        },
      });
    }
    const fb: LandingData | undefined = LANDING_DEFAULTS[slug];
    if (!fb) return NextResponse.json({ ok: false, error: "صفحه پیدا نشد" }, { status: 404 });
    return NextResponse.json({ ok: true, page: { ...fb, published: true, source: "default" } });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای خواندن" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  if (!LANDING_DEFAULTS[slug]) {
    return NextResponse.json({ ok: false, error: "اسلاگ نامعتبر است" }, { status: 400 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data = sanitizeBody(body);
    const page = await db.landingPage.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    return NextResponse.json({ ok: true, page });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای ذخیره" }, { status: 500 });
  }
}
