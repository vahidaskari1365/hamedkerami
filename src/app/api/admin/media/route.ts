import { NextResponse } from "next/server";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-guard";
import { uploadsDir } from "@/lib/uploads-dir";

/* ============================================================
   کتابخانه رسانه — فهرست همه تصاویر سایت
   uploads/ (آپلودهای ادمین) + images/ (تصاویر ثابت سایت، بازگشتی)
   ============================================================ */

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

async function walk(dir: string, base: string, out: { url: string; name: string; dir: string }[], depth = 0) {
  if (depth > 3) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, base, out, depth + 1);
    } else if (e.isFile() && IMG_RE.test(e.name)) {
      const rel = path.relative(path.join(process.cwd(), "public"), full).split(path.sep).join("/");
      out.push({ url: `/${rel}`, name: e.name, dir: path.relative(base, dir) || "." });
    }
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const pub = path.join(process.cwd(), "public");
  const uploads: { url: string; name: string; dir: string }[] = [];
  const site: { url: string; name: string; dir: string }[] = [];
  try {
    const up = uploadsDir();
    await mkdir(up, { recursive: true }).catch(() => {});
    await walk(up, up, uploads);
    await walk(path.join(pub, "images"), path.join(pub, "images"), site);
    uploads.sort((a, b) => (a.name < b.name ? 1 : -1));
    site.sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : a.name < b.name ? -1 : 1));
    return NextResponse.json({ ok: true, uploads, site });
  } catch {
    return NextResponse.json({ ok: true, uploads: [], site: [] });
  }
}
