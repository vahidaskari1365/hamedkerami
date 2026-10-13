import { NextRequest, NextResponse } from "next/server";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-guard";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

/** آپلود تصویر — multipart/form-data با فیلد file */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "فایلی ارسال نشده" }, { status: 400 });
    }
    const ext = EXT_BY_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { ok: false, error: "فقط تصویر JPG، PNG، WebP، GIF، SVG یا AVIF" },
        { status: 400 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "حجم فایل حداکثر ۱۰ مگابایت" },
        { status: 400 }
      );
    }
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای آپلود" }, { status: 500 });
  }
}

/** فهرست تصاویر آپلودشده برای انتخاب از کتابخانه */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const files = await readdir(UPLOAD_DIR);
    const images = files
      .filter((f) => /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(f))
      .map((f) => ({ url: `/uploads/${f}`, name: f }))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 200);
    return NextResponse.json({ ok: true, images });
  } catch {
    return NextResponse.json({ ok: false, images: [] }, { status: 500 });
  }
}
