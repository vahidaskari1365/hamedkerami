import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { ADMIN_ENTITIES, sanitizeBody } from "@/lib/admin-entities";
import { ensureBookingSchema } from "@/lib/booking/schema-guard";

type Ctx = { params: Promise<{ entity: string; id: string }> };

function getDelegate(entity: string) {
  const def = ADMIN_ENTITIES[entity];
  if (!def) return null;
  const delegate = (db as unknown as Record<string, unknown>)[def.model];
  return def && typeof delegate === "object" && delegate
    ? { def, delegate: delegate as Record<string, (...args: unknown[]) => unknown> }
    : null;
}

/** ویرایش رکورد */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { entity, id } = await ctx.params;
  const found = getDelegate(entity);
  if (!found) {
    return NextResponse.json({ ok: false, error: "موجودیت نامعتبر" }, { status: 404 });
  }
  try {
    /* نوبت‌ها — قبل از تغییر، ستون‌های فاز ۲ تضمین می‌شوند */
    if (entity === "appointments") await ensureBookingSchema();
    const body = (await req.json()) as Record<string, unknown>;
    const { data, errors } = sanitizeBody(found.def, body, { partial: true });
    if (errors.length) {
      return NextResponse.json({ ok: false, error: errors.join("، ") }, { status: 400 });
    }
    const row = await found.delegate.update({ where: { id }, data });
    return NextResponse.json({ ok: true, row });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای ذخیره" }, { status: 400 });
  }
}

/** حذف رکورد */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const { entity, id } = await ctx.params;
  const found = getDelegate(entity);
  if (!found) {
    return NextResponse.json({ ok: false, error: "موجودیت نامعتبر" }, { status: 404 });
  }
  try {
    await found.delegate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای حذف" }, { status: 400 });
  }
}
