import type { Metadata } from "next";
import {
  LandingHeader,
  LandingHero,
  LandingSection,
  LandingCards,
  LandingSteps,
  LandingFaq,
  LandingCtaBand,
  LandingFooter,
  SITE_INFO,
} from "@/components/landing/landing-chrome";

const URL = "https://dromfs.com/jaw-surgery";
const HERO = "/images/landing/jaw-surgery-hero.jpg";

export const metadata: Metadata = {
  title: "جراحی فک در تهران | ارتوگناتیک یک فک و دو فک",
  description:
    "جراحی فک با دکتر حامد کرمانی، متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال با بیش از ۱۰۶۷ جراحی موفق. اصلاح فک بالا و پایین، جویدن، تنفس و زیبایی پروفایل. رزرو مشاوره: ۰۲۱-۶۶۹۲۱۵۰۰",
  keywords: [
    "جراحی فک",
    "جراحی فک تهران",
    "جراحی ارتوگناتیک",
    "عمل جراحی فک و صورت",
    "جراح فک و صورت",
    "هزینه جراحی فک",
  ],
  alternates: { canonical: "/jaw-surgery" },
  openGraph: {
    title: "جراحی فک در تهران | دکتر حامد کرمانی",
    description: "اصلاح ناهنجاری فک بالا و پایین با جراحی ارتوگناتیک — بیش از ۱۰۶۷ جراحی موفق",
    url: URL,
    images: [{ url: HERO, width: 1500, height: 650, alt: "جراحی فک" }],
  },
};

const FAQ = [
  {
    q: "جراحی فک چند ساعت طول می کشد؟",
    a: "جراحی یک فک معمولا حدود ۲ تا ۳ ساعت و جراحی دو فک (بایمکس) حدود ۳ تا ۵ ساعت زیر بیهوشی عمومی طول می کشد. مدت دقیق به پیچیدگی ناهنجاری و ترکیب مراحل (مثل جنیوپلاستی یا پیوند استخوان) بستگی دارد.",
  },
  {
    q: "عوارض جراحی فک چیست؟",
    a: "شایع ترین عوارض موقتی هستند: تورم، بی حسی ناحیه لب و چانه که طی هفته ها تا ماه ها برطرف می شود، و خونریزی جزئی. عوارض جدی مانند آسیب دائمی عصب یا عفونت در جراحی های انجام شده توسط جراح باتجربه و در بیمارستان مجهز بسیار نادر است.",
  },
  {
    q: "سن مناسب جراحی فک چه زمانی است؟",
    a: "بهترین زمان پس از پایان رشد اسکلتی است؛ معمولا ۱۷ تا ۱۸ سالگی برای دختران و ۱۹ تا ۲۰ سالگی برای پسران. در بزرگسالان هیچ محدودیت سنی بالایی وجود ندارد، شرط اصلی سلامت عمومی و کنترل بیماری های زمینه ای است.",
  },
  {
    q: "آیا جراحی فک درد دارد؟",
    a: "در ۲۴ تا ۴۸ ساعت اول با داروهای تجویزی کنترل می شود و معمولا از روز سوم به بعد به سرعت کاهش می یابد. اکثر بیماران بیش از تورم و خستگی، درد شدید گزارش نمی کنند.",
  },
  {
    q: "هزینه جراحی فک چقدر است؟",
    a: "طبق تعرفه های منتشرشده این سایت، جراحی های فک حدود ۹۰ تا ۲۴۰ میلیون تومان است و قیمت نهایی به نوع جراحی (یک فک یا دو فک)، بیمارستان و نیاز به پیوند استخوان بستگی دارد. قیمت ها به روزرسانی می شوند؛ برای قیمت دقیق با مطب تماس بگیرید.",
  },
];

export default function JawSurgeryPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: "جراحی فک (ارتوگناتیک)",
    alternateName: "Orthognathic Surgery",
    procedureType: "Surgical",
    bodyLocation: "فک بالا و فک پایین",
    description:
      "جراحی ارتوگناتیک برای اصلاح ناهنجاری های اسکلتی فک بالا و پایین؛ بهبود جویدن، گفتار، تنفس و هارمونی صورت.",
    howPerformed: "زیر بیهوشی عمومی در بیمارستان، با برش های داخل دهانی و صفحه و پیچ تیتانیومی",
    performer: {
      "@type": "Physician",
      name: "دکتر حامد کرمانی",
      medicalSpecialty: "OralAndMaxillofacialSurgery",
      address: {
        "@type": "PostalAddress",
        addressLocality: "تهران",
        addressCountry: "IR",
        streetAddress: SITE_INFO.address,
      },
      telephone: SITE_INFO.phone,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://dromfs.com/" },
      { "@type": "ListItem", position: 2, name: "جراحی فک", item: URL },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />

      <LandingHeader />

      <main className="flex-1">
        <LandingHero
          eyebrow="جراحی فک و صورت"
          h1="جراحی فک در تهران؛ اصلاح ساختاری فک با دکتر حامد کرمانی"
          desc="جراحی فک (ارتوگناتیک) ناهنجاری های اسکلتی فک بالا و پایین را اصلاح می کند تا جویدن، گفتار، تنفس و زیبایی پروفایل شما همزمان بهبود یابد. بیش از ۱۰۶۷ جراحی فک موفق با تخصص OMFS و فلوشیپ کرانیوفاسیال."
          image={HERO}
          imageAlt="جراحی فک — نمای تخصصی"
        />

        <LandingSection title="جراحی فک چیست و چه مشکلاتی را حل می کند؟">
          <p>
            <strong>جراحی فک</strong> یا جراحی ارتوگناتیک، عملی است که موقعیت استخوان فک بالا (ماکسیلا) یا
            فک پایین (ماندیبل) را اصلاح می کند تا دو فک دقیقا روی هم بنشینند. وقتی مشکل از دندان نباشد و
            ریشه در استخوان فک داشته باشد، هیچ مقدار ارتودنسی به تنهایی نمی تواند جویدن و پروفایل را کاملا
            اصلاح کند؛ در این موارد ترکیب ارتودنسی و جراحی فک راه حل استاندارد جهانی است.
          </p>
          <p>
            این جراحی فقط برای زیبایی نیست. ناهنجاری اسکلتی فک روی <strong>عملکرد جویدن</strong>،{" "}
            <strong>گفتار</strong>، <strong>تنفس</strong> و حتی <strong>خواب</strong> اثر می گذارد. بسیاری از
            بیماران با فک عقب‌رفته دچار خروپف و اختلال تنفسی در خواب هستند و با اصلاح موقعیت فک، کیفیت خواب
            و اکسیژن‌رسانی آن ها بهتر می شود.
          </p>
        </LandingSection>

        <LandingSection title="چه کسانی کاندید جراحی فک هستند؟" alt>
          <LandingCards
            items={[
              { title: "فک پایین جلوآمده (کلاس ۳)", desc: "زیرلب بالاتر از لب پایین قرار نمی گیرد و دندان های پایین جلوی دندان های بالا می افتند؛ رایج ترین دلیل مراجعه." },
              { title: "فک عقب‌رفته (کلاس ۲)", desc: "چانه نسبت به بقیه صورت عقب است، خط پروفایل ضعیف می شود و در خواب خروپف و مشکل تنفسی ایجاد می کند." },
              { title: "فک بالا کوچک یا بلند", desc: "لبخند لثه ای، عدم نمایش دندان های بالا هنگام لبخند یا افتادگی زاویه صورت از نشانه های آن است." },
              { title: "عدم تقارن صورت", desc: "خط میانی فک و چانه از خط مرکز صورت منحرف شده و جویدن یک طرفه ایجاد شده است." },
              { title: "مشکل جویدن مزمن", desc: "عدم تماس دندان های جلو، جویدن سخت و فشار غیرطبیعی روی مفصل فک (TMJ)." },
              { title: "آپنه خواب ناشی از فک", desc: "در موارد خاص، جابجایی فک پایین و بالا مسیر هوایی را باز می کند و خواب را اصلاح می نماید." },
            ]}
          />
        </LandingSection>

        <LandingSection title="مراحل جراحی فک از مشاوره تا نتیجه نهایی">
          <LandingSteps
            steps={[
              "مشاوره و معاینه تخصصی — بررسی اکلوزن، پروفایل و شرح حال کامل توسط دکتر کرمانی.",
              "تصویربرداری و تحلیل — رادیوگرافی سفالومتریک و پانورامیک (و در موارد لازم CBCT) برای طراحی دقیق جابجایی استخوان.",
              "ارتودنسی آماده سازی — معمولا ۶ تا ۱۸ ماه مرتب کردن دندان ها پیش از عمل، هماهنگ با ارتودنتیست.",
              "جراحی زیر بیهوشی عمومی — برش های تمام داخل دهانی (بدون جای جراحی روی صورت) و تثبیت با صفحه و پیچ تیتانیوم.",
              "بستری و دوران بهبودی — معمولا ۱ تا ۲ روز بستری، رژیم مایعات و نرم، و بازگشت به کار در ۲ تا ۳ هفته.",
              "ارتودنسی تکمیلی — چند ماه تنظیم نهایی بایت و سپس برداشتن براکت ها.",
            ]}
          />
        </LandingSection>

        <LandingSection title="چرا دکتر حامد کرمانی برای جراحی فک؟" alt>
          <ul className="space-y-3">
            <li className="flex items-start gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />متخصص جراحی فک و صورت (OMFS) — دکترای دندانپزشکی و تخصص از دانشگاه علوم پزشکی مشهد</li>
            <li className="flex items-start gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />فلوشیپ جراحی های کرانیوفاسیال از دانشگاه علوم پزشکی تهران</li>
            <li className="flex items-start gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />بیش از ۱۰۶۷ جراحی فک، ۳۴۷ پیوند استخوان و ۱۶ سال تجربه جراحی</li>
            <li className="flex items-start gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />استادیار سابق دانشگاه های علوم پزشکی شهید بهشتی و مشهد</li>
            <li className="flex items-start gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />تجربه بین المللی در بلژیک، آلمان و چین</li>
          </ul>
        </LandingSection>

        <LandingSection title="سوالات متداول جراحی فک">
          <LandingFaq items={FAQ} />
        </LandingSection>

        <LandingCtaBand
          title="فکر می کنید جراحی فک برای شما مناسب است؟"
          desc="رادیوگرافی خود را در واتسپ مطب بفرستید یا برای مشاوره حضوری تماس بگیرید؛ تشخیص دقیق پس از معاینه و بررسی تصاویر اعلام می شود."
        />
      </main>

      <LandingFooter
        related={[
          { href: "/chin-surgery", label: "جراحی چانه و جنیوپلاستی" },
          { href: "/dental-implant", label: "ایمپلنت دندان" },
          { href: "/implant-pasdaran", label: "ایمپلنت دندان در تهران" },
        ]}
      />
    </div>
  );
}
