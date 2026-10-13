import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { hashPassword, verifyPassword } from "@/lib/auth";

/** تغییر رمز عبور مدیر */
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const { current, next } = (await req.json()) as {
      current?: string;
      next?: string;
    };
    /* حداقل ۸ حرف + ترکیب حرف و عدد */
    const strong =
      typeof next === "string" &&
      next.length >= 8 &&
      next.length <= 128 &&
      /[^\s]/.test(next) &&
      /\p{L}/u.test(next) &&
      /\p{N}/u.test(next);
    if (!current || !strong) {
      return NextResponse.json(
        { ok: false, error: "رمز جدید باید حداقل ۸ حرف و شامل حرف و عدد باشد" },
        { status: 400 }
      );
    }
    const user = await db.adminUser.findUnique({ where: { username: session.u } });
    if (!user || !verifyPassword(current, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "رمز فعلی اشتباه است" },
        { status: 400 }
      );
    }
    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(next) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
