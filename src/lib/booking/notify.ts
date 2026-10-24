import { db } from "@/lib/db";
import { getSmsProvider, smsConnected } from "@/lib/booking/sms";
import type { BookingSettings } from "@/lib/booking/schedule";

/* ============================================================
   اطلاع‌رسانی نوبت — پیام اپراتور + پیام تأیید بیمار
   تا وقتی پنل SMS وصل نیست یا شماره اپراتور تعیین نشده،
   ردیف‌ها با status=queued در صف می‌مانند و در پنل ادمین
   (صفحه نوبت‌ها) نمایش داده می‌شوند؛ بعد از اتصال پنل،
   رزروهای جدید خودکار ارسال می‌شوند.
   ============================================================ */

export interface BookingSnapshot {
  id: string;
  trackingCode: string;
  name: string;
  phone: string;
  doctor: string;
  dayJalali: string;
  slotLabel: string;
  feeToman: number;
  paymentMethod: string;
}

const CLINIC_ADDR = "تهران، بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر، طبقه ۳";

function paymentLabel(m: string): string {
  return m === "online" ? "پرداخت آنلاین" : "پرداخت در مطب";
}

function operatorText(b: BookingSnapshot): string {
  return (
    `نوبت جدید ${b.trackingCode}\n` +
    `بیمار: ${b.name}\n` +
    `تلفن: ${b.phone}\n` +
    `${b.dayJalali} — ${b.slotLabel}\n` +
    `${b.doctor} — ${paymentLabel(b.paymentMethod)}`
  );
}

function patientText(b: BookingSnapshot): string {
  return (
    `نوبت شما در مطب دکتر حامد کرمانی ثبت شد.\n` +
    `کد رهگیری: ${b.trackingCode}\n` +
    `${b.dayJalali} — ${b.slotLabel}\n` +
    `${CLINIC_ADDR}`
  );
}

/** ارسال تلاش‌شده یک پیام — وضعیت را در ردیف به‌روز می‌کند */
async function attemptSend(rowId: string, to: string, body: string): Promise<void> {
  if (!to) {
    await db.bookingNotification.update({
      where: { id: rowId },
      data: { status: "queued", error: "گیرنده تعیین نشده است" },
    });
    return;
  }
  const provider = getSmsProvider();
  const result = await provider.send(to, body);
  await db.bookingNotification.update({
    where: { id: rowId },
    data: result.ok
      ? { status: "sent", error: "", sentAt: new Date() }
      : { status: "failed", error: result.error ?? "ارسال ناموفق" },
  });
}

/**
 * صف‌کردن و تلاش ارسال پیام‌های یک رزرو تازه.
 * operator: همیشه ساخته می‌شود (حتی بدون شماره اپراتور — برای نمایش در پنل)
 * patient: فقط وقتی پنل SMS وصل است معنا دارد؛ در حالت console ساخته نمی‌شود
 *          تا صف پر از ردیف بی‌معنی نشود (پیام تأیید بعداً ارسال خواهد شد).
 */
export async function notifyBooking(
  b: BookingSnapshot,
  settings: BookingSettings,
): Promise<void> {
  const operatorTo = settings.operatorMobile;

  /* پیام اپراتور */
  try {
    const row = await db.bookingNotification.create({
      data: {
        bookingId: b.id,
        kind: "operator_sms",
        to: operatorTo,
        body: operatorText(b),
        status: "queued",
      },
    });
    if (operatorTo) {
      if (smsConnected()) {
        await attemptSend(row.id, operatorTo, row.body);
      } else {
        await db.bookingNotification.update({
          where: { id: row.id },
          data: { error: "پنل پیامک متصل نیست — بعد از اتصال، رزروهای جدید خودکار ارسال می‌شود" },
        });
      }
    }
  } catch (e) {
    console.error("[booking-notify] operator queue failed:", (e as Error).message);
  }

  /* پیام تأیید بیمار — فقط با پنل متصل */
  if (smsConnected()) {
    try {
      const row = await db.bookingNotification.create({
        data: {
          bookingId: b.id,
          kind: "patient_sms",
          to: b.phone,
          body: patientText(b),
          status: "queued",
        },
      });
      await attemptSend(row.id, b.phone, row.body);
    } catch (e) {
      console.error("[booking-notify] patient queue failed:", (e as Error).message);
    }
  }
}

/** تلاش دوباره برای ارسال یک پیام صف‌شده (دکمه پنل ادمین) */
export async function retryNotification(rowId: string): Promise<boolean> {
  const row = await db.bookingNotification.findUnique({ where: { id: rowId } });
  if (!row) return false;
  await attemptSend(row.id, row.to, row.body);
  const fresh = await db.bookingNotification.findUnique({ where: { id: rowId } });
  return fresh?.status === "sent";
}
