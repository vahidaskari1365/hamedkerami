import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-guard";

/* ============================================================
   آپلود تصویر — فقط برای ادمین
   امنیت: سقف ۱۰MB، تشخیص magic bytes (نه MIME ادعایی کلاینت)،
   SVG ممنوع (ذخیره‌ی XSS)، نام فایل تصادفی سمت سرور
   ============================================================ */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const SIGNATURES: { type: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { type: "image/jpeg", ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: "image/png",
    ext: ".png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a,
  },
  {
    type: "image/gif",
    ext: ".gif",
    test: (b) => b.subarray(0, 6).toString("ascii").startsWith("GIF8"),
  },
  {
    type: "image/webp",
    ext: ".webp",
    test: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    type: "image/avif",
    ext: ".avif",
    test: (b) => b.subarray(4, 8).toString("ascii") === "ftyp" && b.subarray(8, 12).toString("ascii").startsWith("avi"),
  },
];

function sniff(buf: Buffer) {
  return SIGNATURES.find((s) => s.test(buf)) ?? null;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "فایلی ارسال نشده است" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "حجم فایل بیش از ۱۰ مگابایت است" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const sig = sniff(buf);
    if (!sig) {
      return NextResponse.json(
        { ok: false, error: "فرمت تصویر پشتیبانی نمی‌شود (JPEG/PNG/WebP/GIF/AVIF)" },
        { status: 400 }
      );
    }
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}${sig.ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    return NextResponse.json({ ok: true, url: `/uploads/${name}`, type: sig.type });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای آپلود" }, { status: 500 });
  }
}

/** فهرست تصاویر آپلودشده — برای کتابخانه رسانه */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const files = await readdir(UPLOAD_DIR);
    const images = files
      .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .map((f) => ({ url: `/uploads/${f}`, name: f }))
      .sort((a, b) => (a.name < b.name ? 1 : -1));
    return NextResponse.json({ ok: true, images });
  } catch {
    return NextResponse.json({ ok: true, images: [] });
  }
}

/** حذف تصویر آپلودشده — فقط فایل‌های داخل /uploads */
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const url = new URL(req.url).searchParams.get("url") ?? "";
  if (!url.startsWith("/uploads/")) {
    return NextResponse.json({ ok: false, error: "فقط فایل‌های آپلودشده قابل حذف هستند" }, { status: 400 });
  }
  const name = path.basename(url);
  if (!/^[a-f0-9-]+\.(jpe?g|png|webp|gif|avif)$/i.test(name)) {
    return NextResponse.json({ ok: false, error: "نام فایل نامعتبر است" }, { status: 400 });
  }
  try {
    await unlink(path.join(UPLOAD_DIR, name));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "حذف فایل ممکن نشد" }, { status: 500 });
  }
}
