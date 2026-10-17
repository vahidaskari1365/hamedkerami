import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { LANDING_DEFAULTS } from "@/lib/landing-defaults";

/** فهرست صفحات فرود + وضعیت هرکدام (از دیتابیس، با تکمیل از پیش‌فرض‌ها) */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const rows = await db.landingPage.findMany({ orderBy: { slug: "asc" } });
    const items = Object.keys(LANDING_DEFAULTS).map((slug) => {
      const row = rows.find((r) => r.slug === slug);
      const fb = LANDING_DEFAULTS[slug];
      return {
        slug,
        label: row?.label ?? fb.label,
        metaTitle: row?.metaTitle ?? fb.metaTitle,
        published: row?.published ?? true,
        updatedAt: row?.updatedAt ?? null,
        source: row ? "db" : "default",
      };
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای خواندن" }, { status: 500 });
  }
}
