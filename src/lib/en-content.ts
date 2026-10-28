import { SITE } from "@/lib/data";

/* ============================================================
   English content for /en — international patients & diaspora.
   Single source of truth for all English copy. Facts mirror
   the Persian site (data.ts): stats, education, services,
   costs policy, clinic hours. Keywords target real queries:
   "jaw surgery in Iran", "orthognathic surgery Tehran",
   "dental implants Tehran", "medical tourism Iran".
   ============================================================ */

export const EN_BRAND = {
  name: "Dr. Hamed Kermani",
  role: "Oral & Maxillofacial Surgeon",
  roleLong: "Oral & Maxillofacial Surgeon · Craniofacial Surgery Fellowship",
  url: `${SITE.url}/en`,
  description:
    "Dr. Hamed Kermani — board-certified oral & maxillofacial surgeon in Tehran with a craniofacial surgery fellowship from Tehran University of Medical Sciences. Orthognathic (single & double jaw) surgery, genioplasty, blepharoplasty, dental implants and jaw reconstruction. International patients welcome.",
};

export const EN_NAV = [
  { path: "/en", label: "Home" },
  { path: "/en/about", label: "About" },
  { path: "/en/services", label: "Services" },
  { path: "/en/jaw-surgery-in-iran", label: "Jaw Surgery" },
  { path: "/en/costs", label: "Costs" },
  { path: "/en/blog", label: "Blog" },
  { path: "/en/contact", label: "Contact" },
];

export const EN_CLINIC = {
  addressEn:
    "Kowsar Medical Building, 3rd floor, Unit 12, Keshavarz Blvd at Jamalzadeh St., Tehran, Iran",
  phoneDisplay: "+98 21 6692 1500",
  whatsappIntl: "https://wa.me/989382080270",
  whatsappText:
    "https://wa.me/989382080270?text=" +
    encodeURIComponent(
      "Hello, I am contacting you through your website about a consultation.",
    ),
  hours: [
    { day: "Saturday", doctor: "Dr. Kermani", time: "3:00–7:00 PM" },
    { day: "Sunday", doctor: "Dr. Kermani", time: "3:00–7:00 PM" },
    { day: "Monday", doctor: "Dr. Kermani", time: "3:00–7:00 PM" },
    { day: "Tuesday", doctor: "Dr. Kermani", time: "3:00–7:00 PM" },
    { day: "Wednesday", doctor: "Dr. Kermani", time: "3:00–7:00 PM" },
    { day: "Thursday & Friday", doctor: "", time: "Closed" },
  ],
};

export const EN_STATS = [
  { value: "20,000+", label: "Dental implants placed" },
  { value: "1,200+", label: "Orthognathic (jaw) surgeries" },
  { value: "5,000+", label: "Other surgical procedures" },
  { value: "100+", label: "Zygomatic implants" },
  { value: "30+", label: "TMJ joint replacements" },
];

export const EN_SUCCESS = [
  {
    rate: "109%",
    title: "Orthognathic (jaw) surgery",
    detail: "Across more than 1,200 successful jaw corrections.",
  },
  {
    rate: "109%",
    title: "Jaw reconstruction & implants",
    detail: "Across more than 20,000 successful treatments.",
  },
  {
    rate: "109%",
    title: "Other procedures",
    detail: "Across more than 5,000 successful surgeries.",
  },
];

export const EN_DOCTORS = [
  {
    name: "Dr. Hamed Kermani",
    fa: "دکتر حامد کرمانی",
    role: "Oral & Maxillofacial Surgeon",
    image: "/images/clinic/dr-portrait.jpg",
    daysEn: "Sat · Sun · Mon · Tue · Wed",
    days: [6, 0, 1, 2, 3],
  },
];

export const EN_SLOTS = ["3:00–5:00 PM", "5:00–7:00 PM", "No preference"];

export const EN_SERVICES = [
  {
    title: "Single-Jaw Orthognathic Surgery",
    desc: "Correction of an over-projected or recessed upper or lower jaw with precisely planned osteotomies — improving the bite (occlusion), speech and facial proportion in one coordinated procedure.",
    points: [
      "Correction of recessed or protruding jaw",
      "Improves the way the teeth meet (occlusion)",
      "Fully coordinated with orthodontic treatment",
    ],
  },
  {
    title: "Double-Jaw (Bimaxillary) Surgery",
    desc: "Simultaneous repositioning of the upper and lower jaw for complex skeletal discrepancies — restoring profile harmony, bite function and airway in a single operation planned digitally before surgery.",
    points: [
      "Upper and lower jaw corrected together",
      "Improves profile, facial balance and breathing",
      "Digital 3-D planning before the operation",
    ],
  },
  {
    title: "Blepharoplasty (Eyelid Surgery)",
    desc: "Eyelid rejuvenation that removes puffiness and sagging of the upper and lower lids through fine incisions hidden inside the natural eyelid crease — a fresher, less tired look.",
    points: [
      "Removes under-eye bags and puffiness",
      "Corrects drooping of the upper eyelid",
      "Hidden incisions in the natural crease",
    ],
  },
  {
    title: "Genioplasty (Chin Surgery)",
    desc: "Surgical reshaping of the chin — advancing, reducing or narrowing it — to bring the lower face into balance and define the jawline.",
    points: [
      "Corrects a recessed chin",
      "Increases or reduces chin height",
      "Strengthens the jawline definition",
    ],
  },
  {
    title: "Dental Implants",
    desc: "Implant treatment with leading international brands — including zygomatic implants for severely resorbed jaws, sinus lifting and guided bone regeneration (GBR) — performed by an OMFS team.",
    points: [
      "German, Swiss, American and Korean implant systems",
      "Zygomatic implants (Straumann and others)",
      "Sinus lift and bone grafting (GBR)",
    ],
  },
  {
    title: "Jaw Reconstruction",
    desc: "Reconstruction of the upper or lower jaw after severe bone loss, tumour resection or trauma — restoring chewing function and facial form with implants and patient-specific prostheses.",
    points: [
      "Maxillary reconstruction with implants",
      "TMJ (jaw joint) prosthetics",
      "Patient-specific custom implants",
    ],
  },
];

export const EN_EDUCATION = [
  { year: "2003", title: "Doctor of Dental Surgery (DDS)", place: "Mashhad University of Medical Sciences" },
  { year: "2010", title: "Specialty in Oral & Maxillofacial Surgery (OMFS)", place: "Mashhad University of Medical Sciences" },
  { year: "2012–2015", title: "Assistant Professor", place: "Shahid Beheshti University of Medical Sciences" },
  { year: "2015–2017", title: "Assistant Professor", place: "Mashhad University of Medical Sciences" },
  { year: "2018", title: "Craniofacial Surgery Fellowship", place: "Tehran University of Medical Sciences" },
];

export const EN_ABOUT = {
  intro:
    "Dr. Hamed Kermani is a board-certified oral & maxillofacial surgeon in Tehran. He completed his dental degree (DDS) at Mashhad University of Medical Sciences in 2003, his OMFS specialty in 2010, and a craniofacial surgery fellowship at Tehran University of Medical Sciences in 2018 — one of the few surgeons in Iran with this sub-specialty training covering the skull, orbits and facial skeleton.",
  academic:
    "Alongside his formal training, Dr. Kermani has completed numerous national and international courses and has observed advanced maxillofacial practice in Belgium, Germany and China — including an oncology and jaw-reconstruction course at the Shanghai Ninth People's Hospital (2019). He served as an assistant professor at Shahid Beheshti (2012–2015) and Mashhad (2015–2017) universities of medical sciences. He is the author of 18 scientific papers on jaw and facial surgery indexed on Google Scholar, and holds the European Association for Cranio-Maxillo-Facial Surgery (EACMFS) certificate.",
  quote:
    "Successful treatment depends on solid academic and clinical experience, commitment to scientific principles — and freedom from financial considerations.",
  highlights: [
    "Craniofacial fellowship — Tehran University of Medical Sciences",
    "18 scientific publications on Google Scholar",
    "International training: Belgium, Germany, China",
    "Former university assistant professor (OMFS)",
  ],
};

/* ---------- Landing: Jaw Surgery in Iran ---------- */
export const EN_LANDING = {
  eyebrow: "Medical travel guide",
  h1: "Jaw Surgery in Iran — Orthognathic Surgery in Tehran",
  heroDesc:
    "Corrective jaw surgery in Iran combines fellowship-trained surgeons, high surgical volume and hospital-grade care — at a cost that is typically a fraction of US, UK or Gulf prices. Dr. Hamed Kermani plans and performs orthognathic, bimaxillary and chin surgeries for international patients in Tehran, with online consultations before you fly.",
  whyTitle: "Why patients travel to Iran for jaw surgery",
  why: [
    {
      title: "High-volume, fellowship-trained surgeons",
      desc: "Iranian oral & maxillofacial surgeons treat one of the largest patient populations in the region. Dr. Kermani alone has performed 1,200+ jaw and facial surgeries with a 109% success rate across more than 1,200 orthognathic cases.",
    },
    {
      title: "A fraction of the cost",
      desc: "Compared with the US, UK, Turkey or the Gulf states, the all-in cost of double-jaw surgery in Iran is typically 50–70% lower — with comparable hospital standards. You receive a transparent, personalized quote before you commit.",
    },
    {
      title: "Complete care in one trip",
      desc: "Consultation, imaging, surgery and the first follow-ups all happen in a single 10–14 day visit to Tehran, with online follow-up after you return home.",
    },
    {
      title: "English-speaking communication",
      desc: "Dr. Kermani and the clinic team communicate in English, and all coordination — from your first message to your final follow-up — runs through one dedicated WhatsApp line.",
    },
  ],
  stepsTitle: "How it works — from first message to flying home",
  steps: [
    {
      title: "Send your records",
      desc: "Message us on WhatsApp with your cephalometric X-ray, panoramic radiograph (OPG) and face photos (front and profile). No referral is needed.",
    },
    {
      title: "Online consultation",
      desc: "Dr. Kermani reviews your case, explains the surgical options (single jaw, bimaxillary, genioplasty) and answers your questions on a video call.",
    },
    {
      title: "Surgical plan & quote",
      desc: "You receive a written treatment plan with a transparent price quote, so you can budget the whole trip before booking anything.",
    },
    {
      title: "Travel to Tehran",
      desc: "We schedule everything around your dates — the clinic is centrally located on Keshavarz Boulevard. We provide the appointment letter needed for an Iranian medical visa application.",
    },
    {
      title: "Surgery & recovery",
      desc: "The operation is performed under general anaesthesia in a fully equipped hospital. Most patients stay 10–14 days in Tehran for sutures, check-ups and early healing before flying.",
    },
    {
      title: "Follow-up from home",
      desc: "After you fly home, your healing is followed online — photos and video calls — and your local orthodontist continues the final tooth alignment with our written guidance.",
    },
  ],
  candidateTitle: "Who is a candidate for corrective jaw surgery?",
  candidateDesc:
    "Orthognathic surgery is recommended when the position of the upper or lower jaw affects the bite, breathing, speech or facial balance. Typical signs include a recessed or protruding lower jaw, an open bite, chronic jaw asymmetry, snoring or sleep apnoea caused by a small lower jaw, and a gummy or unbalanced smile that orthodontics alone cannot fix. If you are still in orthodontic treatment, we coordinate the surgical timing with your orthodontist — braces are usually kept in place during the operation.",
  costsTitle: "What does jaw surgery in Iran cost?",
  costsDesc:
    "Exact pricing depends on the type of surgery (single jaw, double jaw, with or without genioplasty), hospital choice and implant materials. As a reference point, the full cost of corrective jaw surgery in Iran is typically 50–70% below equivalent packages in Turkey or the Gulf, and a fraction of US or UK private prices. You receive your exact quote in writing after the online consultation — no surprises, no hidden fees.",
  faqs: [
    {
      q: "How much does double jaw surgery cost in Iran?",
      a: "The price is quoted per case after the surgeon reviews your X-rays and photos. As a general reference, corrective jaw surgery in Iran costs a fraction of US or UK prices and is typically 50–70% lower than comparable packages in Turkey or the Gulf. You receive a written, all-inclusive quote before you travel.",
    },
    {
      q: "How long should I stay in Iran for jaw surgery?",
      a: "We recommend 10 to 14 days in Tehran: a few days for pre-operative imaging and planning, the surgery itself, and early recovery with clinic check-ups and suture removal before your flight home.",
    },
    {
      q: "Can I have an online consultation before travelling?",
      a: "Yes — that is the standard first step. Send your cephalometric X-ray, panoramic radiograph and facial photos on WhatsApp, and Dr. Kermani will review your case and meet you on a video call before you book any travel.",
    },
    {
      q: "Will someone help me with the visa process?",
      a: "Most patients apply for an Iranian medical visa. The clinic provides the appointment and treatment letter you need for the application. You should start the visa process as soon as your surgery date is confirmed.",
    },
    {
      q: "Is the surgery performed in a hospital?",
      a: "Yes. Orthognathic and bimaxillary surgeries are performed under general anaesthesia in a fully equipped hospital with an anaesthesiology team, and post-operative care continues at the clinic.",
    },
    {
      q: "Do I need braces before jaw surgery?",
      a: "Many patients have orthodontic treatment before surgery to align the teeth, but the required duration varies. Send your records first — Dr. Kermani will tell you whether you need orthodontic preparation and coordinate the plan with your orthodontist.",
    },
    {
      q: "Can chin surgery (genioplasty) be combined with jaw surgery?",
      a: "Yes. Genioplasty is frequently combined with single- or double-jaw surgery in the same operation to perfect the facial profile — it adds little operative time and one recovery period.",
    },
    {
      q: "What follow-up do I get after returning home?",
      a: "Your healing is followed online with photo reviews and video calls. Written guidance is sent to your local orthodontist or dentist so the final phase of treatment continues smoothly at home.",
    },
  ],
};

/* ---------- Landing: Costs (jaw surgery cost in Iran) ---------- */
export const EN_COSTS = {
  eyebrow: "Transparent pricing · 2026",
  h1: "Jaw Surgery Cost in Iran — 2026 Price Guide",
  heroDesc:
    "The cost of jaw surgery in Iran ranges from about 90 million tomans for chin (genioplasty) surgery to 240 million tomans for simultaneous correction of both jaws and the chin — a fraction of equivalent US, UK or Gulf prices. Dr. Hamed Kermani gives every patient a written, itemized treatment plan before any payment, so the final number is never a surprise.",
  answerBox:
    "Jaw surgery in Iran costs between 90 and 240 million tomans in 2026: chin surgery (genioplasty) 90–110, single-jaw surgery 170–180, one jaw plus chin (monomax) 180–190, double-jaw (bimaxillary) surgery 190–200, and both jaws plus chin 210–240 million tomans. The exact price depends on the severity of the deformity, the orthodontic phase and anaesthesia, and is confirmed only after examination.",
  tableTitle: "Price table — jaw & chin surgery in Iran (2026)",
  tableHead: ["Procedure", "2026 price (million tomans)", "What it corrects"],
  tableRows: [
    ["Chin surgery (genioplasty)", "90 – 110", "Recessed, over-projected or small chin"],
    ["Single-jaw surgery", "170 – 180", "When only one jaw is skeletally affected"],
    ["One jaw + chin (monomax)", "180 – 190", "Profile correction with one anaesthesia"],
    ["Double-jaw surgery (bimaxillary)", "190 – 200", "The most frequent orthognathic operation"],
    ["Both jaws + chin", "210 – 240", "Full facial profile reconstruction"],
  ],
  tableNote:
    "The figures above cover the complete treatment package — surgeon and team, general anaesthesia, hospital and early follow-up visits. The orthodontic phase before surgery is calculated separately, and the final quote is issued in writing after examination and radiographs.",
  factorsTitle: "What determines the final price?",
  factors: [
    {
      title: "Complexity of the deformity",
      desc: "A small single-jaw movement needs a shorter operation and a smaller team; a severe discrepancy involving both jaws and the chin requires longer surgery, more instrumentation and a longer hospital stay — all reflected in the quote.",
    },
    {
      title: "The orthodontic phase",
      desc: "Most patients carry 12–18 months of braces before the operation, and this phase is billed separately from the surgery itself. Coordinating the surgeon and orthodontist shortens it — send your records early for a combined plan.",
    },
    {
      title: "Anaesthesia and hospital",
      desc: "General anaesthesia, the class of hospital and the length of admission are a serious share of the bill. All quotes are itemized so you can see exactly what each component costs before you commit.",
    },
    {
      title: "The surgeon's experience",
      desc: "An experienced jaw surgeon lowers the probability of a revision operation — which is the single largest possible saving. Dr. Kermani has performed more than 1,200 orthognathic and facial surgeries with a craniofacial fellowship.",
    },
  ],
  insuranceTitle: "Does insurance cover jaw surgery in Iran?",
  insuranceDesc:
    "Honesty matters here: the functional part of jaw surgery — correcting a skeletal deformity and a bite disorder — is often covered by Iranian insurance providers, with an official invoice and surgical procedure code issued. Purely cosmetic requests without a documented functional problem should not expect real coverage. Your exact insurance share depends on your base and supplementary policy and is clarified transparently in the consultation session.",
  faqTitle: "Jaw surgery cost in Iran — frequently asked questions",
  faqs: [
    {
      q: "How much does double jaw surgery cost in Iran in 2026?",
      a: "Double-jaw (bimaxillary) surgery in Iran costs about 190–200 million tomans, and adding chin surgery brings the package to 210–240 million tomans. The quote is issued in writing after the surgeon reviews your X-rays and photos.",
    },
    {
      q: "Is the price in tomans or US dollars?",
      a: "Local pricing is quoted in Iranian tomans. Because living and operating costs in Iran are far below Western countries, the same package converts to a fraction of US, UK or Gulf prices — typically 50–70% lower than comparable packages in Turkey or the Gulf.",
    },
    {
      q: "What is included in the quoted package?",
      a: "The surgeon and surgical team, general anaesthesia, the operating room and hospital stay, and the early follow-up visits are included. Pre-operative imaging, the orthodontic phase and medication are itemized separately so you can compare offers fairly.",
    },
    {
      q: "Can I pay in installments?",
      a: "Yes — this is in fact the most common structure. Part of the amount is paid at the start, part near the surgery date and part during follow-up visits, so the financial pressure is spread over months instead of a single point.",
    },
    {
      q: "How do I get my exact quote?",
      a: "Send your cephalometric X-ray, panoramic radiograph and face photos on WhatsApp. Dr. Kermani reviews your case, and you receive a written treatment plan with a transparent, all-inclusive price quote — before you book any travel.",
    },
  ],
};

/* ---------- Blog (EN listing) ---------- */
export const EN_BLOG = {
  crumb: "Blog",
  eyebrow: "Educational articles",
  h1: "Oral & Maxillofacial Surgery Articles — Dr. Hamed Kermani",
  desc: "In-depth articles on jaw surgery, genioplasty, TMJ disorders, dental implants and treatment costs. Below the article list you will find the English patient guides for international visitors — costs, surgeon selection, visa and recovery in Iran.",
  searchLabel: "Search articles:",
  searchPlaceholder: "Try: cost, recovery, botox, chin, implant…",
  resultsOne: "article found",
  resultsMany: "articles found",
  noResultsTitle: "We don't have this topic yet",
  noResultsDesc:
    "Try simpler words, or ask the surgeon directly — your question may become the next article on this blog.",
  askTitle: "Ask the surgeon directly",
  askDesc: "If you could not find your answer in the articles, send your question via WhatsApp or phone:",
  persianBadge: "Persian article",
  readArticle: "Read the article",
  featured: "Featured article",
  /* glossary: EN token → Persian equivalents used inside the articles */
  glossary: {
    cost: "هزینه",
    price: "قیمت",
    recovery: "مراقبت",
    healing: "بهبود",
    botox: "بوتاکس",
    implant: "ایمپلنت",
    chin: "چانه",
    jaw: "فک",
    surgery: "جراحی",
    insurance: "بیمه",
    asymmetry: "نامتقارنی",
    asymmetry2: "فک کج",
    tmj: "مفصل",
    "sleep-apnea": "آپنه",
    snoring: "خروپف",
    "before-after": "قبل و بعد",
    complications: "عوارض",
    orthodontics: "ارتودنسی",
    braces: "ارتودنسی",
    filler: "فیلر",
    "gummy-smile": "لثه",
    fracture: "شکستگی",
    cleft: "شکاف",
    genioplasty: "جنیوپلاستی",
    orthognathic: "ارتوگناتیک",
  } as Readonly<Record<string, string>>,
};
