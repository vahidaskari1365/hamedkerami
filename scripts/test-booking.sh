#!/usr/bin/env bash
# تست کلیک‌محور کامل ویزار رزرو نوبت — مرورگر واقعی (agent-browser)
set -e
cd /home/z/my-project
mkdir -p .screenshots

# سرور توسعه (اگر بالا نیست)
if ! curl -s -o /dev/null --max-time 3 http://localhost:3000/; then
  setsid bash -c 'exec bun run dev' >/dev/null 2>&1 < /dev/null &
  sleep 12
fi
curl -s -o /dev/null --max-time 60 http://localhost:3000/appointment
echo "=== server ready ==="

B="agent-browser"
$B close >/dev/null 2>&1 || true
$B open http://localhost:3000/appointment --timeout 60000
$B wait --load networkidle --timeout 30000 || true
sleep 1
$B set viewport 1280 900
$B screenshot .screenshots/booking-1-welcome.png --full

# گام ۱: شروع رزرو
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('شروع رزرو نوبت'));
  if (btn) { btn.click(); return 'started'; }
  return 'no start button';
})()
"
sleep 1.6
$B screenshot .screenshots/booking-2-date.png --full

# گام ۲: انتخاب روز — اولین روز فعال در تقویم (دکمه‌های غیرمعلول تقویم)
$B snapshot -i -c > /tmp/snap-date.txt
DAY_REF=$(grep -oP '@e\d+(?=.+؟)' /tmp/snap-date.txt | head -1 || true)
# از find استفاده می‌کنیم: اولین دکمه با aria-pressed قابل انتخاب
$B eval "
(() => {
  const btns = [...document.querySelectorAll('button[aria-label]')].filter(b =>
    b.getAttribute('aria-label').match(/^(شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه)/) && !b.disabled
  );
  if (btns.length) { btns[0].click(); return 'clicked: ' + btns[0].getAttribute('aria-label'); }
  return 'no day button found';
})()
"
sleep 1.6
$B screenshot .screenshots/booking-3-time.png --full

# گام ۳: انتخاب بازه ساعت — اولین بازه آزاد
$B eval "
(() => {
  const btns = [...document.querySelectorAll('button')].filter(b =>
    (b.textContent || '').includes('ظرفیت باقی‌مانده') && !b.disabled
  );
  if (btns.length) { btns[0].click(); return 'slot clicked: ' + btns[0].textContent.slice(0, 40); }
  return 'no slot';
})()
"
sleep 1.6
$B screenshot .screenshots/booking-4-payment.png --full

# گام ۴: پرداخت — ادامه
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('ادامه'));
  if (btn) { btn.click(); return 'continue clicked'; }
  return 'no continue';
})()
"
sleep 1.2
$B screenshot .screenshots/booking-5-info.png --full

# گام ۵: اطلاعات بیمار
$B snapshot -i -c > /tmp/snap-info.txt
NAME_REF=$(grep -oP '@e\d+' /tmp/snap-info.txt | head -30 | while read r; do :; done; true)
$B find label "نام و نام خانوادگی بیمار *" fill "مریم تستی"
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').trim() === 'آقا');
  if (btn) { btn.click(); return 'gender set'; }
  return 'no gender btn';
})()
"
$B eval "
(() => {
  const el = document.getElementById('bw-latin');
  if (el) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, 'Maryam Testi');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return 'latin set';
  }
  return 'no latin field';
})()
"
$B eval "
(() => {
  const el = document.getElementById('bw-birth');
  if (el) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, '۱۳۷۰');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return 'birth set';
  }
  return 'no birth field';
})()
"
sleep 0.5
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('ادامه'));
  if (btn) { btn.click(); return 'continue clicked'; }
  return 'no continue';
})()
"
sleep 1.2
$B screenshot .screenshots/booking-6-review.png --full

# گام ۶: بازبینی — تأیید و ادامه
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('تأیید و ادامه'));
  if (btn) { btn.click(); return 'review confirmed'; }
  return 'no confirm';
})()
"
sleep 1.2
$B screenshot .screenshots/booking-7-verify.png --full

# گام ۷: موبایل + کد
$B eval "
(() => {
  const el = document.getElementById('bw-phone');
  if (el) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, '09121112234');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return 'phone set';
  }
  return 'no phone';
})()
"
$B eval "
(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('تأیید و ارسال کد'));
  if (btn) { btn.click(); return 'otp requested'; }
  return 'no otp button';
})()
"
sleep 2.5
$B screenshot .screenshots/booking-8-otp.png --full

# خواندن کد تست از صفحه و ورود آن با کلیدهای واقعی
CODE=$($B eval "(() => { const m = document.body.innerText.match(/کد شما:[^0-9]*(\\d{5})/); return m ? m[1] : ''; })()" | tr -d '"')
echo "=== devCode read from page: $CODE ==="
if [ -n "$CODE" ]; then
  $B eval "(() => { const i = document.querySelector('[data-input-otp]'); i.focus(); return 'focused'; })()" >/dev/null
  for d in $(echo $CODE | fold -w1); do $B press "$d" >/dev/null; done
  sleep 4
  $B screenshot .screenshots/booking-9-success.png --full
  $B eval "document.body.innerText.includes('قطعی شد') ? 'SUCCESS SCREEN OK' : 'STILL NOT SUCCESS'"
fi

echo "=== console errors ==="
$B errors || true
echo "=== page url ==="
$B get url || true
