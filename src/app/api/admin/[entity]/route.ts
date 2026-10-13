import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { ADMIN_ENTITIES, sanitizeBody } from "@/lib/admin-entities";

type Ctx = { params: Promise<{ entity: string }> };

function getDelegate(entity: string) {
  const def = ADMIN_ENTITIES[entity];
  if (!def) return null;
  // delegate با نام مدل camelCase در Prisma Client
  const delegate = (db as unknown as Record<string, unknown>)[def.model];
  return def && typeof delegate === "object" && delegate
    ? { def, delegate: delegate as Record<string, (...args: unknown[]) => unknown> }
    : null;
}

/** لیست رکوردها */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { entity } = await ctx.params;
  const found = getDelegate(entity);
  if (!found) {
    return NextResponse.json({ ok: false, error: "موجودیت نامعتبر" }, { status: 404 });
  }
  try {
    const rows = await found.delegate.findMany({
      orderBy: found.def.orderBy,
    });
    return NextResponse.json({ ok: true, rows });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای خواندن" }, { status: 500 });
  }
}

/** ایجاد رکورد */
export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { entity } = await ctx.params;
  const found = getDelegate(entity);
  if (!found) {
    return NextResponse.json({ ok: false, error: "موجودیت نامعتبر" }, { status: 404 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { data, errors } = sanitizeBody(found.def, body, { partial: false });
    if (errors.length) {
      return NextResponse.json({ ok: false, error: errors.join("، ") }, { status: 400 });
    }
    const row = await found.delegate.create({ data });
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Unique")
      ? "این شناسه (slug یا کلید) قبلاً استفاده شده است"
      : "خطای ذخیره";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
