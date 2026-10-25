#!/usr/bin/env node
/* ============================================================
   فیکس محتوایی مقاله زنده — افزودن بخش «پرسش های پرتکرار» + لینک
   داخلی + برجسته‌سازی به مقاله‌هایی که قبل از گیت‌های AEO/SXO منتشر
   شده‌اند (جاوااسکریپت خالص — در GitHub Actions با AGENT_SECRET اجرا
   می‌شود؛ مسیر انتشار: POST /api/agents/publish همان مسیر ایجنت روزانه)
   اجرا: SLUG=jaw-surgery-cost-1405 AGENT_SECRET=... node scripts/fix-article-faq.mjs
   ============================================================ */

const SITE_URL = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const SLUG = process.env.SLUG || "";

/* بخش‌های FAQ به تفکیک اسلاگ — جمله‌ها اختصاصی نوشته شده‌اند تا گیت
   یکتایی (۶+ کلمه) پاس شود؛ لینک داخلی به پیلارهای BOFU/مقالات و
   حداقل دو ** توپر ** برای گیت SXO داخل همین متن تأمین می‌شود. */
const FAQ_BY_SLUG = {
  "jaw-surgery-cost-1405": `

## پرسش های پرتکرار درباره هزینه جراحی فک

### تعرفه جراحی ارتوگناتیک و بایمکس چه تفاوتی با هم دارد؟
تفاوت اصلی در تعداد فک‌های تحت عمل و حجم شبیه‌سازی دیجیتال پیش از عمل است. **عمل تک‌فک** با تجهیزات و زمان کمتری انجام می‌شود، اما جراحی دو فک (بایمکس) برنامه‌ریزی گسترده‌تری می‌خواهد و به همین دلیل تعرفه بالاتری دارد. جزئیات هر بسته درمانی در جلسه مشاوره به‌صورت شفاف اعلام می‌شود. مقایسه سرویس‌ها را در صفحه [هزینه خدمات](/costs) ببینید.

### آیا بیمه بخشی از هزینه جراحی فک را می‌پردازد؟
وقتی جراحی برای رفع اختلال عملکردی مثل مشکل گاز گرفتن یا اختلال مفصل انجام شود، بیمه‌گر ممکن است تا سقف تعهد خود بخشی از هزینه‌ها را تقبل کند. **بخش زیبایی و اصلاح ظاهر** معمولاً خارج از پوشش است و شخصاً پرداخت می‌شود. مدارک پزشکی خود را پیش از عمل برای بررسی در اختیار مطب قرار دهید. راهنمای کامل را در [مقاله بیمه و جراحی فک](/blog/jaw-surgery-insurance) بخوانید.

### هزینه های جانبی بعد از خود عمل کدام‌ها هستند؟
علاوه بر تعرفه اصلی، آزمایش پیش از عمل، رادیوگرافی، داروهای دوره بهبود و مراجعات کنترل به مجموع هزینه اضافه می‌شوند. برنامه ریزی مالی واقع‌بینانه فقط زمانی ممکن است که همه این اقلام از ابتدا دیده شوند. تیم مطب دکتر حامد کرمانی در جلسه مشاوره برآورد کامل و شفاف از همین فهرست ارائه می‌دهد. چک‌لیست دوره بهبود را هم در [مراقبت های بعد از جراحی فک](/blog/jaw-surgery-recovery-care) ببینید.

### چطور تعرفه دقیق جراحی خودم را پیدا کنم؟
عدد ثابتی برای همه بیماران وجود ندارد، چون الگوی اسکلتی، شدت ناهماهنگی و نیاز به ارتودنسی پیش از عمل در هر فرد متفاوت است. **ارزیابی حضوری همراه با تصویربرداری** تنها راه رسیدن به عدد دقیق است. برای هماهنگی مشاوره با شماره ۰۹۳۸-۲۰۸۰۲۷۰ تماس بگیرید یا رادیوگرافی خود را در واتساپ ارسال کنید. اطلاعات پایه را نیز در [راهنمای جراحی فک](/jaw-surgery) مطالعه کنید.`,
};

async function main() {
  if (!SLUG || !FAQ_BY_SLUG[SLUG]) {
    console.error(`SLUG نامعتبر یا بدون FAQ تعریف‌شده: "${SLUG}" — موجود: ${Object.keys(FAQ_BY_SLUG).join(", ")}`);
    process.exit(1);
  }
  if (!process.env.AGENT_SECRET) {
    console.error("AGENT_SECRET تنظیم نشده است");
    process.exit(1);
  }

  /* ۱ — متن کامل مقاله از llms-full.txt (منبع: دیتابیس زنده) */
  const llms = await (await fetch(`${SITE_URL}/llms-full.txt`)).text();
  const marker = `آدرس: ${SITE_URL}/blog/${SLUG}`;
  const at = llms.indexOf(marker);
  if (at < 0) {
    console.error(`مقاله ${SLUG} در llms-full.txt نیست`);
    process.exit(1);
  }
  const metaEnd = llms.indexOf("\n\n", llms.indexOf("نویسنده", at)) + 2;
  let end = llms.indexOf("\n\n---\n\n", metaEnd);
  const body = llms.slice(metaEnd, end > 0 ? end : undefined).trim();

  /* ۲ — متا از صفحه زنده */
  const html = await (await fetch(`${SITE_URL}/blog/${SLUG}`)).text();
  const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`)) || [])[1] || "";
  const title = og("title");
  const excerpt = og("description");
  const coverPath = og("image").replace(SITE_URL, "") || undefined;
  if (!title || !excerpt) {
    console.error("متای og ناقص است");
    process.exit(1);
  }

  /* ۳ — جلوگیری از اجرای تکراری */
  if (body.includes("پرسش های پرتکرار")) {
    console.log("بخش پرسش های پرتکرار از قبل موجود است — کاری انجام نشد");
    process.exit(0);
  }

  const newBody = `${body}\n\n${FAQ_BY_SLUG[SLUG].trim()}\n`;
  const keyword = title.split(/[؛|]/)[0].trim().slice(0, 60);

  /* ۴ — انتشار از همان مسیر ایجنت (همه گیت‌های سردبیر اعمال می‌شود) */
  const res = await fetch(`${SITE_URL}/api/agents/publish`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-agent-key": process.env.AGENT_SECRET },
    body: JSON.stringify({ slug: SLUG, title, excerpt, body: newBody, keyword, cover: coverPath }),
  });
  const out = await res.json().catch(() => ({}));
  console.log(`HTTP ${res.status} — ${JSON.stringify(out, null, 1)}`);
  process.exit(res.ok ? 0 : 1);
}

main().catch((e) => {
  console.error("خطا:", e.message);
  process.exit(1);
});
