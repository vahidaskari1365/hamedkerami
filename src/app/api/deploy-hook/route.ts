import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * دیپلوی خودکار: وقتی پایپ‌لاین گیت‌هاب پکیج تازه (deploy-package.tar.gz) را
 * روی سرور می‌گذارد، این route پروسه فعلی را بااحترام خاموش می‌کند تا Passenger
 * پروسه تازه بسازد — server.js بوت‌استرپی پکیج را اکسترکت و نسخه جدید را سرو می‌کند.
 *
 * فقط وقتی پکیج در انتظار باشد اثر دارد؛ در حالت عادی 404 می‌دهد (بدون اثر جانبی).
 */
export async function POST() {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: false, reason: "only in production" }, { status: 404 });
  }
  const pkg = path.join(process.cwd(), "deploy-package.tar.gz");
  if (!fs.existsSync(pkg)) {
    return NextResponse.json({ ok: false, reason: "no pending package" }, { status: 404 });
  }
  setTimeout(() => process.exit(0), 300);
  return NextResponse.json({ ok: true, message: "package pending — restarting to activate new deploy" });
}
