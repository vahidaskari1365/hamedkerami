import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadsDir } from "@/lib/uploads-dir";

/* ============================================================
   سرو تصاویر آپلودشده — /uploads/<نام‌فایل>
   سرور پروداکشن فایل‌های public را فقط هنگام استارت فهرست می‌کند؛
   این route فایل‌های تازه‌ی آپلودشده را هم بدون ری‌استارت سرو می‌کند.
   امنیت: فقط نام فایل با الگوی UUID-تصادفی مجاز است (بدون مسیر traversal).
   ============================================================ */

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const NAME_RE = /^[a-f0-9][a-f0-9-]{0,64}\.(jpe?g|png|webp|gif|avif)$/i;

type Ctx = { params: Promise<{ file: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { file } = await ctx.params;
  if (!NAME_RE.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const buf = await readFile(path.join(uploadsDir(), file));
    const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
