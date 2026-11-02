import { type NextRequest, NextResponse } from "next/server";

/* موقت — تشخیص سیگنال پروتکل پشت LiteSpeed برای فیکس http→https.
   پس از اندازه‌گیری حذف می‌شود. */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    protocol: req.nextUrl.protocol,
    xForwardedProto: req.headers.get("x-forwarded-proto"),
    host: req.headers.get("host"),
  });
}
