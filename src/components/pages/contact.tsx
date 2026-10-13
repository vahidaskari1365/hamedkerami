"use client";

import { useState } from "react";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { useContent } from "@/lib/content-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function ContactPage() {
  const { site: SITE, hours: HOURS } = useContent();
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          /* تله‌ی ربات — کاربر واقعی آن را نمی‌بیند و پر نمی‌کند */
          website: fd.get("website"),
        }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "پیام شما ثبت شد",
        description: "کارشناسان مطب در اولین فرصت با شما تماس می گیرند.",
      });
      form.reset();
    } catch {
      toast({
        title: "خطا در ارسال پیام",
        description: "لطفا دوباره تلاش کنید یا با مطب تماس بگیرید.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHero
        crumb="تماس با ما"
        eyebrow="تماس با ما"
        title="مشاوره، رزرو نوبت و آدرس مطب"
        desc="مشاوره تلفنی در تمام ایام هفته پاسخگوی شماست. برای رزرو نوبت با شماره مطب تماس بگیرید یا پیام خود را از طریق فرم ارسال کنید."
      />

      <section className="bg-bone py-20" aria-label="اطلاعات تماس و فرم پیام">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* contact cards */}
          <div className="space-y-5">
            <Reveal>
              <div className="grid gap-5 sm:grid-cols-2">
                <a href={`tel:${SITE.phone}`} className="group rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5 transition hover:shadow-xl hover:shadow-teal/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/12 text-teal-3" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"/></svg>
                  </span>
                  <p className="mt-5 text-sm text-foreground/55">شماره تماس مطب</p>
                  <p className="mt-1 text-lg font-black group-hover:text-teal-3" dir="ltr">
                    {SITE.phoneDisplay}
                  </p>
                </a>
                <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="group rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5 transition hover:shadow-xl hover:shadow-teal/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/12 text-teal-3" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z"/></svg>
                  </span>
                  <p className="mt-5 text-sm text-foreground/55">واتسپ (ارسال رادیوگرافی)</p>
                  <p className="mt-1 text-lg font-black group-hover:text-teal-3" dir="ltr">
                    {SITE.whatsappDisplay}
                  </p>
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
                <div className="flex items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/12 text-teal-3" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
                  </span>
                  <div>
                    <p className="text-sm text-foreground/55">آدرس مطب</p>
                    <p className="mt-1 font-bold leading-8">{SITE.address}</p>
                    <a
                      href={SITE.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-3 transition hover:gap-3"
                    >
                      مشاهده در نقشه (گوگل مپ)
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M19 12H5m6-6l-6 6 6 6"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="overflow-hidden rounded-2xl bg-ink p-7 text-white shadow-sm">
                <p className="flex items-center gap-3 text-sm font-bold text-teal">
                  <span className="h-px w-8 bg-teal" aria-hidden />
                  ساعات کاری
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {HOURS.map((h) => (
                    <li key={h.day} className="flex items-center justify-between border-b border-white/8 pb-2.5">
                      <span className="text-white/75">
                        {h.day}
                        {h.doctor && <span className="text-white/40"> — {h.doctor}</span>}
                      </span>
                      <span className={h.time === "تعطیل" ? "text-red-300" : "font-bold text-white"}>
                        {h.time}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-xl bg-teal/12 p-4 text-xs leading-6 text-white/80">
                  رزرو نوبت: {SITE.phoneDisplay} — مشاوره تلفنی در تمام ایام هفته
                </p>
              </div>
            </Reveal>
          </div>

          {/* form */}
          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink/5 sm:p-10"
              aria-label="فرم ارسال پیام"
            >
              <h2 className="text-xl font-black">ارسال پیام</h2>
              <p className="mt-2 text-sm text-foreground/60">
                پیام های خود را از طریق فرم زیر ارسال کنید؛ در اولین فرصت پاسخ داده می شود.
              </p>
              <div className="mt-8 grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input id="name" name="name" required placeholder="نام شما" className="h-12" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" dir="ltr" className="h-12 text-right" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">موضوع</Label>
                  <Input id="subject" name="subject" required placeholder="مثلا: مشاوره جراحی دو فک" className="h-12" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">توضیحات (اختیاری)</Label>
                  <Textarea id="message" name="message" rows={5} placeholder="شرح حال یا سوال خود را بنویسید..." />
                </div>
                {/* honeypot — با CSS و tabindex از دید کاربر و اسکرین‌ریدر پنهان است */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="website">وبسایت</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-2 h-13 rounded-full bg-teal py-4 text-base font-bold text-white shadow-lg shadow-teal/25 transition hover:bg-teal-2 disabled:opacity-60"
                >
                  {sending ? "در حال ارسال..." : "ارسال پیام"}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
