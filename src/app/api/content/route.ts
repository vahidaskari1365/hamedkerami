import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/site-content";

/** محتوای کامل سایت — عمومی */
export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ ok: true, content }, { headers: { "Cache-Control": "no-store" } });
}
