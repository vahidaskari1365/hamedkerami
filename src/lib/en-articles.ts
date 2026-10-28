import { SITE } from "@/lib/data";

/* ============================================================
   مقاله‌های انگلیسی توریسم پزشکی — فاز ۸ keyword-plan.md
   دستی و خارج از خط تولید ایجنت فارسی؛ هر مقاله با لندینگ‌های /en
   و مقاله فارسی معادل (hreflang) متصل است. کیوردها فقط از
   docs/seo/keyword-plan.md (ردیف‌های ۴۳ تا ۵۰).
   ============================================================ */

export interface EnArticleSection {
  h2: string;
  paras: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
}

export interface EnArticle {
  slug: string;
  keyword: string;
  /** H1 صفحه — همیشه با کیورد دقیق شروع می‌شود */
  title: string;
  /** meta description — ۱۲۰ تا ۱۶۰ کاراکتر */
  excerpt: string;
  /** پاسخ مستقیم ابتدای صفحه (۵۰ تا ۹۰ کلمه) — AEO/AI answer */
  answer: string;
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  /** مقاله فارسی معادل برای hreflang */
  fa: { href: string; label: string };
  /** x-default به فارسی اشاره کند یا به انگلیسی */
  xDefaultFa?: boolean;
  sections: EnArticleSection[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
}

const WA =
  "https://wa.me/989382080270?text=Hello%2C%20I%20am%20considering%20treatment%20in%20Tehran.";

/* ---------- ۴۳ — jaw surgery cost in Iran ---------- */
const COST_IRAN: EnArticle = {
  slug: "jaw-surgery-cost-in-iran",
  keyword: "jaw surgery cost in Iran",
  title: "Jaw Surgery Cost in Iran (2026): Complete Price Guide for International Patients",
  excerpt:
    "Jaw surgery in Iran costs 90–240 million tomans in 2026 depending on the operation. See the full 2026 price table, what the package includes and how to get your exact quote.",
  answer:
    "Jaw surgery in Iran costs between 90 and 240 million tomans in 2026 — chin surgery (genioplasty) 90–110, single-jaw surgery 170–180, one jaw plus chin 180–190, double-jaw (bimaxillary) surgery 190–200, and both jaws plus chin 210–240 million tomans. That equals a fraction of US or UK private prices and is typically 50–70% below comparable packages in Turkey or the Gulf. Every patient of Dr. Hamed Kermani receives a written, itemized quote after a free online review of their X-rays.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 8,
  fa: { href: "/blog/jaw-surgery-cost-1405", label: "نسخه فارسی: هزینه جراحی فک ۱۴۰۵" },
  xDefaultFa: false,
  sections: [
    {
      h2: "2026 price table — jaw and chin surgery in Iran",
      paras: [
        "Iranian hospitals and clinics quote locally in tomans, and the figure below reflects the published 2026 price list of Dr. Hamed Kermani's clinic in Tehran. Each package covers the complete surgical episode: the surgeon and his team, general anaesthesia, the operating room and hospital stay, and the early follow-up visits. The numbers below are the reference range used in the clinic — your personal quote is issued in writing after your X-rays are reviewed, because the severity of the deformity changes the operative time, the hospital stay and therefore the price.",
      ],
      table: {
        head: ["Procedure", "2026 price (million tomans)", "What it corrects"],
        rows: [
          ["Chin surgery (genioplasty)", "90 – 110", "Recessed, over-projected or small chin"],
          ["Single-jaw surgery", "170 – 180", "When only one jaw is skeletally affected"],
          ["One jaw + chin (monomax)", "180 – 190", "Profile correction with one anaesthesia"],
          ["Double-jaw surgery (bimaxillary)", "190 – 200", "The most frequent orthognathic operation"],
          ["Both jaws + chin", "210 – 240", "Full facial profile reconstruction"],
        ],
      },
    },
    {
      h2: "Why is jaw surgery in Iran more affordable?",
      paras: [
        "The price gap is economic, not clinical. Operating costs, staff salaries and facility fees in Iran are far below those of the US, the UK or the Gulf states, while the surgical training pathway is identical: Iranian oral and maxillofacial surgeons complete a full hospital-based specialty program, and the leading ones add fellowship training on top. High surgical volume is the second factor — a surgeon who performs several orthognathic operations every week runs an efficient, standardized pathway that keeps the price down without cutting corners.",
        "It is important to separate 'affordable' from 'cheap'. The quote you receive covers a general-anaesthesia operation in a fully equipped hospital, digital 3-D planning before surgery, and a follow-up schedule — the same components you would be billed for in any developed system. What you do not pay for is the administrative overhead and insurance bureaucracy that inflate Western private prices.",
      ],
    },
    {
      h2: "What is included in the quoted package?",
      paras: [
        "Transparency is the clinic's written policy: every quote is itemized so you can compare offers fairly. The surgical package includes the surgeon and surgical team, general anaesthesia, the operating room and hospital admission, and the early follow-up visits after discharge.",
      ],
      list: [
        "Included: surgeon and team fees, anaesthesia, hospital and operating room, early follow-up visits",
        "Separate: pre-operative imaging (cephalometric X-ray, OPG, CBCT) and laboratory tests",
        "Separate: the orthodontic phase before surgery — billed by your orthodontist over 12–18 months",
        "Separate: medication and any optional services you choose",
      ],
    },
    {
      h2: "What determines your final quote?",
      paras: [
        "Four variables move the number. The complexity of the deformity decides how long the operation lasts and whether one jaw or two jaws are repositioned. The hospital class and length of admission set the facility share. The orthodontic phase, when needed, is a parallel track with its own cost. And the surgeon's experience matters financially in a less obvious way: an experienced jaw surgeon lowers the probability of a revision operation, which is the single largest possible extra cost in this type of surgery.",
        "Dr. Hamed Kermani has performed more than 1,200 orthognathic and facial surgeries, holds a craniofacial surgery fellowship from Tehran University of Medical Sciences, and issues every international patient a written treatment plan before any payment is taken.",
      ],
    },
    {
      h2: "Insurance, installments and payment",
      paras: [
        "For Iranian residents, the functional component of orthognathic surgery — correcting a skeletal bite disorder — is often partially covered by insurance with an official procedure code. International patients should not expect Iranian insurance coverage; instead, the clinic keeps the self-pay price transparent and offers staged payment: part at the start, part near the surgery date and part during follow-up visits. Payment is made in Iranian tomans, and the clinic team guides you through the practical options during the planning conversation.",
      ],
    },
    {
      h2: "How to get your exact quote before you fly",
      paras: [
        "The first step costs nothing. Send your cephalometric X-ray, panoramic radiograph and face photos (front and profile) on WhatsApp, and Dr. Kermani reviews the case personally. You then receive a written treatment plan with an all-inclusive price quote — so you can budget the whole trip, surgery included, before booking any flight.",
      ],
    },
  ],
  faqs: [
    {
      q: "How much does double jaw surgery cost in Iran in 2026?",
      a: "Double-jaw (bimaxillary) surgery in Iran costs about 190–200 million tomans in 2026, and adding chin surgery brings the package to 210–240 million tomans. The quote is issued in writing after the surgeon reviews your X-rays and photos.",
    },
    {
      q: "Is the price quoted in tomans or US dollars?",
      a: "Local pricing is quoted in Iranian tomans. Because operating costs in Iran are far below Western levels, the same package converts to a fraction of US, UK or Gulf prices — typically 50–70% lower than comparable packages in Turkey or the Gulf.",
    },
    {
      q: "Does the price include the hospital and anaesthesia?",
      a: "Yes. The surgical package includes the surgeon and team, general anaesthesia, the operating room, the hospital stay and early follow-up visits. Imaging, the orthodontic phase and medication are itemized separately.",
    },
    {
      q: "Why is jaw surgery in Iran cheaper than in Turkey or the Gulf?",
      a: "The difference is economic: lower facility and staffing costs and very high surgical volume, not a lower standard of care. Iranian maxillofacial surgeons complete the same hospital-based specialty training, and the procedure itself is performed under general anaesthesia in a fully equipped hospital.",
    },
    {
      q: "How do I receive my exact quote?",
      a: "Send your cephalometric X-ray, panoramic radiograph and face photos on WhatsApp. Dr. Kermani reviews your case and you receive a written, itemized treatment plan with the final price before you commit to any travel.",
    },
  ],
  related: [
    { label: "Jaw Surgery in Iran — the complete patient guide", href: "/en/jaw-surgery-in-iran" },
    { label: "2026 cost page", href: "/en/costs" },
    { label: "Orthognathic surgery in Iran — patient journey", href: "/en/blog/orthognathic-surgery-in-iran" },
    { label: "Contact and free case review", href: "/en/contact" },
  ],
};

/* ---------- ۴۴ — jaw surgeon in Tehran ---------- */
const SURGEON_TEHRAN: EnArticle = {
  slug: "jaw-surgeon-in-tehran",
  keyword: "jaw surgeon in Tehran",
  title: "Jaw Surgeon in Tehran: 9 Criteria for Choosing the Right One",
  excerpt:
    "Choosing a jaw surgeon in Tehran? Use these 9 verifiable criteria — board specialty, fellowship, case volume, digital planning and transparent written quotes — before you book.",
  answer:
    "A reliable jaw surgeon in Tehran should pass nine checks: a formal oral & maxillofacial surgery specialty (not a short course), sub-specialty fellowship training, a verifiable case volume in the hundreds, hospital operating privileges, digital 3-D planning, academic publications, clear English communication, a written itemized quote before payment, and a structured follow-up system. Dr. Hamed Kermani — 1,200+ jaw surgeries, craniofacial fellowship, 18 publications — is one of the surgeons who meets all nine.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 9,
  fa: { href: "/blog/best-jaw-surgeon-tehran", label: "نسخه فارسی: بهترین جراح فک و صورت در تهران" },
  xDefaultFa: false,
  sections: [
    {
      h2: "Why the choice of surgeon matters more than the price",
      paras: [
        "Orthognathic surgery is a millimetre-level operation: the surgeon repositions facial bones against a digitally planned target, and the result — your bite, your breathing and your profile — is permanent. There is no 'try again cheaply' in this field; a revision operation is longer, harder and more expensive than the first surgery. That is why international patients should screen Tehran's many providers with objective criteria rather than by price or advertising alone.",
      ],
    },
    {
      h2: "The 9 criteria — how to verify each one",
      paras: [
        "Ask each candidate surgeon for the nine items below. Every one of them is verifiable in a five-minute conversation or from official sources, and a confident, qualified surgeon will answer them without hesitation.",
      ],
      list: [
        "1. Formal specialty: board-certified Oral & Maxillofacial Surgery (OMFS) — a 4+ year hospital residency, not a cosmetic short course",
        "2. Sub-specialty training: a craniofacial or orthognathic fellowship adds the complex-case skill set",
        "3. Case volume: hundreds of orthognathic operations — volume is the strongest predictor of smooth outcomes",
        "4. Hospital privileges: the operation must be done under general anaesthesia in a fully equipped hospital, not a clinic room",
        "5. Digital planning: 3-D cephalometric planning and surgical splints designed before the operation",
        "6. Academic record: publications and university teaching signal depth beyond marketing",
        "7. Communication: English-speaking surgeon and team, one dedicated coordination channel (WhatsApp)",
        "8. Written quote: an itemized treatment plan and price before any payment",
        "9. Follow-up system: scheduled reviews, online photo follow-up after you fly home, and written guidance for your local orthodontist",
      ],
    },
    {
      h2: "How Dr. Hamed Kermani's profile answers these criteria",
      paras: [
        "Dr. Kermani completed his dental degree (DDS) at Mashhad University of Medical Sciences in 2003 and his OMFS specialty in 2010. He then served as an assistant professor of maxillofacial surgery at Shahid Beheshti (2012–2015) and Mashhad (2015–2017) universities, and completed a craniofacial surgery fellowship at Tehran University of Medical Sciences in 2018 — a sub-specialty held by few Iranian surgeons, covering the facial skeleton, orbits and skull base.",
        "His case volume exceeds 1,200 orthognathic and facial surgeries and 20,000 dental implants, including more than 100 zygomatic implants and 30 TMJ joint replacements. He is the author of 18 indexed scientific papers, holds the EACMFS (European Association for Cranio-Maxillo-Facial Surgery) certificate, and has observed advanced maxillofacial practice in Belgium, Germany and China. For international patients, the clinic runs a dedicated English-speaking WhatsApp line, issues written itemized quotes before payment, and follows healing online after the patient returns home.",
      ],
    },
    {
      h2: "Red flags to walk away from",
      paras: [
        "Some signals should end the conversation immediately. Be cautious with providers who cannot name their hospital, who quote a final price before seeing any X-ray, who promise 'no braces needed' to every patient, or who cannot show before-and-after documentation of real orthognathic cases. Also be careful about title inflation: in Iran, 'cosmetic jaw surgery' is sometimes offered by practitioners without OMFS specialty training — the phrase to insist on is 'متخصص جراحی فک و صورت', a licensed oral and maxillofacial surgeon.",
      ],
    },
    {
      h2: "A practical shortlisting process",
      paras: [
        "Send the same package — cephalometric X-ray, panoramic radiograph and two face photos — to two or three candidate surgeons, and compare their written answers: the proposed operation, the plan around your orthodontics, the quote structure and the follow-up schedule. The surgeon who gives you the most specific, most verifiable plan is usually the safest choice, regardless of who is cheapest.",
      ],
    },
  ],
  faqs: [
    {
      q: "What is the difference between an oral & maxillofacial surgeon and a cosmetic dentist?",
      a: "An OMFS specialist completes a university hospital residency of four or more years in facial bone surgery and holds a licence for osteotomies under general anaesthesia in hospital. Cosmetic dentists are trained in teeth and soft tissues, not in skeletal jaw repositioning — orthognathic surgery is outside their legal scope.",
    },
    {
      q: "How many jaw surgeries should an experienced surgeon have performed?",
      a: "There is no official threshold, but the literature associates better outcomes with higher volume. In Tehran, high-volume orthognathic surgeons report several hundred to over a thousand cases — Dr. Kermani's count exceeds 1,200 jaw and facial surgeries.",
    },
    {
      q: "Does a fellowship really matter for jaw surgery?",
      a: "Yes for complex cases. A craniofacial fellowship adds training on severe asymmetries, syndromic patients, airway problems and combined facial skeleton procedures — exactly the cases international patients often travel for.",
    },
    {
      q: "Can I verify a Tehran surgeon's credentials from abroad?",
      a: "Ask for the university and year of specialty completion, the fellowship certificate, hospital name and publication list — all verifiable. Dr. Kermani's education timeline (Mashhad 2003/2010, craniofacial fellowship TUMS 2018) is published on this site with certificates.",
    },
    {
      q: "Should I choose the cheapest quote?",
      a: "No. Compare quotes only after each surgeon has seen your imaging and proposed a specific operation. An unusually low price with a vague plan usually means hidden components later — or a surgeon with little orthognathic volume, which is the costliest risk of all.",
    },
  ],
  related: [
    { label: "About Dr. Hamed Kermani (EN)", href: "/en/about" },
    { label: "Orthognathic surgery in Iran — patient journey", href: "/en/blog/orthognathic-surgery-in-iran" },
    { label: "Jaw surgery cost in Iran (2026)", href: "/en/blog/jaw-surgery-cost-in-iran" },
    { label: "Send my records for review", href: "/en/contact" },
  ],
};

/* ---------- ۴۵ — orthognathic surgery in Iran ---------- */
const ORTHO_JOURNEY: EnArticle = {
  slug: "orthognathic-surgery-in-iran",
  keyword: "orthognathic surgery in Iran",
  title: "Orthognathic Surgery in Iran: The Complete Patient Journey, Step by Step",
  excerpt:
    "What happens at every step of orthognathic surgery in Iran — records review, online consultation, written plan, surgery in hospital and a 10–14 day treatment trip in Tehran.",
  answer:
    "Orthognathic surgery in Iran follows a seven-step journey: you send your X-rays and photos, the surgeon reviews them online and meets you on a video call, you receive a written surgical plan and itemized quote, you travel to Tehran (10–14 days), the operation is performed under general anaesthesia in a hospital, you recover with daily clinic support, and your healing is followed online after you fly home. Braces continue before and after surgery, coordinated in writing with your orthodontist.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 10,
  fa: { href: "/jaw-surgery", label: "نسخه فارسی: جراحی فک و صورت" },
  xDefaultFa: true,
  sections: [
    {
      h2: "What orthognathic surgery corrects — and who needs it",
      paras: [
        "Orthognathic (corrective jaw) surgery repositions the upper jaw, the lower jaw, or both, when the skeletal base of the bite is wrong. The typical indications are a recessed or protruding lower jaw, an open bite that the lips cannot close over, vertical maxillary excess (a gummy smile with a long face), facial asymmetry, and jaw positions that narrow the airway and contribute to snoring or sleep apnoea. Orthodontics alone can move teeth, but it cannot move the jaw bones — when the problem is skeletal, surgery is the only definitive correction.",
        "The operation itself is done entirely inside the mouth, leaving no visible facial scars. Bone cuts are made according to a digital 3-D plan, the jaws are moved to the planned position and fixed with tiny titanium plates that stay for life. General anaesthesia and a hospital operating room are mandatory; the usual hospital stay is one to two nights.",
      ],
    },
    {
      h2: "Step 1 — send your records",
      paras: [
        "Everything starts with four files, all of which you can photograph at any radiology center at home: a cephalometric X-ray (side-skull view), a panoramic radiograph (OPG), and two face photos — front and profile, in natural lighting. Send them on WhatsApp with a short description of your main concern. No referral letter is needed, and this first review is free.",
      ],
    },
    {
      h2: "Step 2 — the online consultation",
      paras: [
        "Dr. Kermani reviews the case personally and meets you on a video call. He explains what is skeletally wrong, which operation corrects it — single-jaw, double-jaw (bimaxillary), with or without genioplasty — what changes to expect in profile and bite, and how your current orthodontic stage fits the timeline. You should ask anything; the goal of this call is that you understand your own plan, not that you sign up for travel.",
      ],
    },
    {
      h2: "Step 3 — written plan and quote",
      paras: [
        "After the call you receive a written treatment plan: the proposed operation, the hospital, the anaesthesia arrangements, the total stay and an itemized price. Nothing is paid at this stage. The written format matters — it lets you compare offers objectively and it becomes the reference document for your whole trip.",
      ],
    },
    {
      h2: "Step 4 — travel to Tehran",
      paras: [
        "Once your date is confirmed, the clinic issues the appointment and treatment letter required for an Iranian medical visa application. The clinic sits on Keshavarz Boulevard in central Tehran, close to hotels and the city's main hospitals. Plan to arrive a few days before surgery for the in-person examination, CBCT scan and final splint fabrication.",
      ],
    },
    {
      h2: "Step 5 — the operation and the first week",
      paras: [
        "Surgery takes two to four hours depending on whether one jaw or two jaws are repositioned. You wake up in a hospital ward with an anaesthesiology team monitoring you; most patients go home — or to their hotel — after one or two nights. Swelling peaks around day three and visibly improves from day seven. You will be on a soft, then blended diet for several weeks, and the clinic sees you several times in the first two weeks for checks and suture removal.",
      ],
    },
    {
      h2: "Step 6 — flying home and finishing orthodontics",
      paras: [
        "Most international patients fly home between days 10 and 14, once the surgeon confirms safe healing for a flight. After that, follow-up continues online: you send photos at set intervals, and video calls replace in-person visits. Your local orthodontist finishes the final tooth alignment — the clinic sends written guidance and the surgical records so the two teams work from the same plan. Titanium plates stay in place permanently and do not set off airport scanners in any meaningful way.",
      ],
    },
    {
      h2: "Typical timeline at a glance",
      paras: ["Every case is individual, but this is the standard rhythm for an international patient:"],
      list: [
        "Month 0: records sent, online consultation, written plan and quote",
        "Month 0–1: visa application; orthodontic preparation continues if you are in braces",
        "Month 1–2: travel to Tehran — examination, CBCT, surgery, 10–14 day stay",
        "Month 2–4: bone healing (bony union) under online follow-up",
        "Month 4–12: final orthodontic refinement at home",
        "Month 12: final assessment — bite, profile and function",
      ],
    },
  ],
  faqs: [
    {
      q: "How long do I need to stay in Iran for orthognathic surgery?",
      a: "Ten to fourteen days in Tehran is the standard: a few days for pre-operative examination and imaging, the surgery itself, and early recovery with clinic check-ups and suture removal before your flight home.",
    },
    {
      q: "Is orthognathic surgery in Iran safe?",
      a: "The operation is performed under general anaesthesia in a fully equipped hospital by a licensed OMFS specialist. Dr. Kermani has performed more than 1,200 orthognathic and facial surgeries. Like any operation it has risks — bleeding, infection, nerve effects — which are discussed openly in the consultation; high-volume experience is the main factor that keeps them rare.",
    },
    {
      q: "Will I have scars on my face?",
      a: "No external scars. All incisions are made inside the mouth, and the titanium plates used to fix the bones sit under the soft tissue permanently without being visible.",
    },
    {
      q: "Can jaw surgery fix my sleep apnoea or snoring?",
      a: "When sleep apnoea is caused by a small, set-back lower jaw, advancing the jaw enlarges the airway and can significantly reduce or resolve the obstruction. Your sleep study and airway assessment are reviewed as part of the surgical planning.",
    },
    {
      q: "What about numbness after surgery?",
      a: "Temporary numbness of the cheeks, lips or chin is normal for weeks to months because the sensory nerves are stretched during repositioning. The great majority of patients recover normal sensation; permanent change is uncommon and is discussed case by case before surgery.",
    },
    {
      q: "When can I return to work or university?",
      a: "Most patients look presentable for public life two to three weeks after surgery and feel fully functional by weeks four to six. International patients usually schedule the surgery so that the flight home coincides with the third week of recovery.",
    },
  ],
  related: [
    { label: "Jaw Surgery in Iran — main guide", href: "/en/jaw-surgery-in-iran" },
    { label: "Traveling to Iran for jaw surgery — visa & stay", href: "/en/blog/jaw-surgery-iran-medical-tourism" },
    { label: "Jaw surgery cost in Iran (2026)", href: "/en/blog/jaw-surgery-cost-in-iran" },
    { label: "Start with a free records review", href: "/en/contact" },
  ],
};

/* ---------- ۴۶ — dental implants in Iran ---------- */
const IMPLANTS_IRAN: EnArticle = {
  slug: "dental-implants-in-iran",
  keyword: "dental implants in Iran",
  title: "Dental Implants in Iran: Brands, Quality and Price Comparison",
  excerpt:
    "Dental implants in Iran use the same German, Swiss, American and Korean systems as Europe — at a far lower price. See how quality is guaranteed and what a fair quote includes.",
  answer:
    "Dental implants in Iran are placed with the same international systems used in Europe and the US — German, Swiss, American and Korean brands including Straumann — with genuine-product documentation for every fixture. Because operating costs are low and surgical volume is very high, the all-in price per implant is a fraction of Western quotes, without changing the hardware or the protocol. Dr. Hamed Kermani's team has placed more than 20,000 implants, including 100+ zygomatic implants for severe bone loss.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 9,
  fa: { href: "/dental-implant", label: "نسخه فارسی: ایمپلنت دندان" },
  xDefaultFa: true,
  sections: [
    {
      h2: "Which implant brands are used in Iran?",
      paras: [
        "The leading Tehran clinics import and place the same global systems available in Germany, Switzerland, the UK and the US. The available tier is wide: premium Swiss systems such as Straumann (including the zygomatic line), German and American systems, and high-quality Korean systems that balance budget and performance. The brand is chosen with you before the operation, and every fixture arrives in its sealed sterile packaging with a lot number and authenticity documentation that you receive with your invoice.",
        "This is the decisive quality check for any cross-border implant treatment: insist that the brand, the country of manufacture and the original packaging are stated in your written plan. Dr. Kermani's clinic includes all three in the standard quote, so the product you are paying for is never ambiguous.",
      ],
    },
    {
      h2: "How does the price compare with Europe and the Gulf?",
      paras: [
        "The implant fixture itself is a globally priced medical device — the real saving comes from the surgical and prosthetic fees, hospital-grade imaging, and the absence of insurance-driven overheads. In practice, a complete implant treatment in Tehran (fixture, abutment and crown) costs a fraction of an equivalent European or Gulf quotation, typically 50–70% less, while using the same hardware and the same two-stage surgical protocol.",
        "The exact figure depends on the brand tier, the number of implants, whether bone grafting (GBR) or a sinus lift is needed, and the type of final restoration. You receive the itemized numbers in writing after your CBCT and photos are reviewed online — before you book any travel.",
      ],
    },
    {
      h2: "Complex cases are a routine part of the practice",
      paras: [
        "International patients often arrive with the difficult cases: long-standing tooth loss, thin or resorbed ridges, failed previous implants. This is where volume and sub-specialty training show. Dr. Kermani's team routinely performs guided bone regeneration, sinus lifting, ridge splitting and immediate (fresh-socket) implants — the real operative videos of these techniques are published on the clinic's channel.",
        "For the most resorbed upper jaws, zygomatic implants anchored in the cheekbone avoid bone grafting entirely and can carry a fixed bridge — more than 100 of these have been placed here. Dr. Kermani's craniofacial fellowship and OMFS specialty also mean that medically complex patients (controlled diabetes, anticoagulant use, previous jaw surgery) are assessed at hospital level rather than declined by default.",
      ],
    },
    {
      h2: "The treatment timeline for international patients",
      paras: [
        "A standard single implant needs one surgical visit and one prosthetic visit separated by two to four months of healing — but the trip can be compressed: with immediate protocols, many patients receive the implant and a temporary crown in one short stay and finish the final crown on a later visit or at home. Full-arch reconstruction (All-on-4 style) usually fits into one 10–14 day trip for the surgical phase with a fixed temporary bridge, and the final prosthesis is delivered on a short second visit.",
      ],
      list: [
        "Visit 1 (7–14 days in Tehran): CBCT and planning, implant surgery, temporary teeth when applicable",
        "Healing at home: 2–4 months of integration with online photo follow-up",
        "Visit 2 (3–7 days): impressions and delivery of the final ceramic bridge or crowns",
      ],
    },
    {
      h2: "Aftercare and warranty",
      paras: [
        "Implant success is a partnership: the surgeon controls the precision of placement, and the patient controls hygiene and review attendance. You leave with a written maintenance schedule — professional cleaning and check every six months at home, with online reviews between visits. Peri-implantitis is preventable when plaque is controlled early, and the clinic documents the bone levels around each fixture so any change is caught at the first review, not the third.",
      ],
    },
  ],
  faqs: [
    {
      q: "Are the implants used in Iran genuine international brands?",
      a: "Yes — fixtures are imported in sealed sterile packaging with lot numbers and authenticity documentation, and the brand and country of manufacture are written into your treatment plan and invoice.",
    },
    {
      q: "How much does a dental implant cost in Iran?",
      a: "The all-in price (fixture, abutment, crown) is a fraction of European or Gulf quotes — typically 50–70% lower — and depends on the brand tier, bone condition and restoration type. You receive an itemized written quote after your CBCT is reviewed online.",
    },
    {
      q: "How many trips do I need?",
      a: "Usually two short trips: the surgical visit (7–14 days) and, after 2–4 months of healing, a second visit (3–7 days) for the final ceramic work. Simple single-implant cases are sometimes compressed with immediate protocols.",
    },
    {
      q: "Can implants be placed if my bone is thin?",
      a: "Yes in the great majority of cases. Guided bone regeneration, sinus lifting, ridge splitting and — for severely resorbed upper jaws — zygomatic implants solve most bone deficits without long grafting delays.",
    },
    {
      q: "What is the success rate?",
      a: "Modern implant systems report 10-year survival above 95% in the literature; the clinic's own volume exceeds 20,000 placed implants. Smoking and uncontrolled diabetes are the two main factors that lower success and are addressed before surgery.",
    },
  ],
  related: [
    { label: "Zygomatic implants in Iran — severe bone loss", href: "/en/blog/zygomatic-implants-in-iran" },
    { label: "Services — implants and reconstruction (EN)", href: "/en/services" },
    { label: "Jaw surgery cost in Iran (2026)", href: "/en/blog/jaw-surgery-cost-in-iran" },
    { label: "Send my CBCT for a quote", href: "/en/contact" },
  ],
};

/* ---------- ۴۷ — zygomatic implants in Iran ---------- */
const ZYGOMATIC_IRAN: EnArticle = {
  slug: "zygomatic-implants-in-iran",
  keyword: "zygomatic implants in Iran",
  title: "Zygomatic Implants in Iran: The Advanced Answer to Severe Bone Loss",
  excerpt:
    "Zygomatic implants in Iran anchor fixed teeth in the cheekbone when the upper jaw has no bone left — no grafting, no waiting. See candidacy, protocol, cost logic and experience.",
  answer:
    "Zygomatic implants in Iran are long implants anchored in the dense cheekbone (zygoma) instead of the resorbed upper jaw, allowing a fixed full-arch bridge without bone grafting. The protocol usually delivers a temporary fixed bridge on the day of surgery and the final bridge a few months later. Dr. Hamed Kermani has placed more than 100 zygomatic implants and offers this solution at a fraction of European or Gulf prices, with the candidacy decision made on a CBCT scan — not on advertising.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 8,
  fa: { href: "/blog/zygomatic-implant-guide", label: "نسخه فارسی: راهنمای ایمپلنت زایگوماتیک" },
  xDefaultFa: true,
  sections: [
    {
      h2: "What a zygomatic implant actually is",
      paras: [
        "A zygomatic implant is a extra-long titanium fixture (typically 35–52.5 mm) that enters through the upper jaw and anchors horizontally in the zygomatic bone — the cheekbone — which is one of the densest bones of the face and is almost never affected by the resorption that destroys the upper jaw after long-standing tooth loss. Two zygomatic implants at the back, combined with two to four standard implants at the front, are usually enough to carry a complete fixed arch for one side of the mouth or a full upper restoration.",
        "The clinical meaning is simple: patients who were told 'you have no bone for implants, you need grafting first' — or worse, 'you can only wear a removable denture' — can have fixed teeth. The cheekbone replaces the missing bone instead of waiting for bone to be grown.",
      ],
    },
    {
      h2: "Who is a candidate — and who is not",
      paras: [
        "The candidate profile is the severely resorbed upper jaw: long-standing edentulism, failed grafts, extreme bone loss after periodontal disease or a failed denture, or anatomical situations such as a very pneumatized (enlarged) maxillary sinus. The disqualifying cases are equally clear — active sinus infection, uncontrolled systemic disease, or a patient whose bone volume is actually sufficient for standard implants, in which case zygomatic implants would be an unnecessary and more expensive operation.",
        "That is why the decision is made on a CBCT scan with 3-D planning software, never on photos. The clinic's protocol is explicit: first scan and planning, then a written plan with priced options — including the standard-implant route — and only then the patient chooses. A significant part of the consultation is identifying the patients who do NOT need zygomatic implants.",
      ],
    },
    {
      h2: "The surgical protocol and what happens on the day",
      paras: [
        "The operation is performed under general anaesthesia in a hospital. In the classic 'one-day' protocol, the implants are placed through the mouth — no external incisions — and a fixed temporary bridge is attached the same day, so you leave the operating room with teeth in function. The swelling of the first week is the main recovery event; most patients are socially presentable within ten to fourteen days. After three to six months of integration, the final ceramic or metal-ceramic bridge is fabricated.",
        "Because the surgical field is close to the orbit and the sinus, this is a procedure where surgeon experience is decisive. More than 100 zygomatic implants have been placed in this practice, and the technique sits alongside a full bone-grafting arsenal — sinus lifts and GBR — so the recommendation is driven by your anatomy, not by a single preferred tool.",
      ],
    },
    {
      h2: "Cost logic: zygomatic versus grafting",
      paras: [
        "Per fixture, a zygomatic implant costs more than a standard one — the design is patient-specific, the surgery is longer, and it requires a surgeon experienced in the region. But the honest comparison is the whole treatment: the grafting route for a severely resorbed maxilla means one or more bone graft operations, six to twelve months of waiting, and a higher total failure-and-revision risk. For that patient group, the zygomatic route is frequently cheaper in total and dramatically faster — one operation, teeth in a day, final bridge in months.",
      ],
      table: {
        head: ["Factor", "Zygomatic route", "Grafting route"],
        rows: [
          ["Surgical operations", "Usually one", "One to three"],
          ["Time to fixed teeth", "Same day (temporary)", "Six to twelve months"],
          ["Hospital requirement", "One hospital admission", "Multiple admissions"],
          ["Best for", "Severe maxillary resorption", "Moderate, localised bone loss"],
        ],
      },
    },
    {
      h2: "Price and travel for international patients",
      paras: [
        "Iran prices the zygomatic package at a fraction of European and Gulf quotes while using the same international implant systems (including Straumann's zygomatic line). The quote covers the implants, the surgery and anaesthesia, the hospital admission, the temporary bridge and the follow-up visits; the final bridge is quoted separately so the numbers stay comparable. The standard visit plan is a 10–14 day stay for surgery and the temporary prosthesis, and a short second visit for the final bridge. Send your CBCT (or take one in Tehran on arrival) for the written plan.",
      ],
    },
  ],
  faqs: [
    {
      q: "Am I too resorbed for any implant?",
      a: "Almost never. The zygomatic bone resorbs far slower than the upper jaw, which is why zygomatic implants succeed in jaws that look 'empty' on X-ray. The CBCT scan decides; in this practice roughly no patient is rejected for bone shortage alone.",
    },
    {
      q: "Is the zygomatic surgery painful?",
      a: "It is performed under general anaesthesia, and post-operative discomfort is managed with standard analgesia. Most patients describe the first week — swelling and tightness — rather than sharp pain, and normal social life resumes within ten to fourteen days.",
    },
    {
      q: "Are the teeth really fixed on the day of surgery?",
      a: "Yes — in the one-day protocol a fixed temporary bridge is attached before you leave the operating room. You eat soft foods with it during healing, and the final ceramic bridge is delivered after three to six months.",
    },
    {
      q: "What are the specific risks of zygomatic implants?",
      a: "The main anatomical considerations are the orbit, the sinus and the cheek region: temporary swelling, sinus pressure or bruising around the cheek can occur, and are discussed openly before surgery. With 3-D planning and high surgical volume, published success rates are above 95%.",
    },
    {
      q: "How much does it cost in Iran compared to Europe?",
      a: "The full package (implants, surgery, hospital, temporary bridge) is typically 50–70% below equivalent European or Gulf quotations, using the same international systems. You receive an itemized written quote after CBCT review.",
    },
  ],
  related: [
    { label: "Dental implants in Iran — brands & prices", href: "/en/blog/dental-implants-in-iran" },
    { label: "2026 cost page", href: "/en/costs" },
    { label: "Send my CBCT for a quote", href: "/en/contact" },
  ],
};

/* ---------- ۴۸ — TMJ treatment in Iran ---------- */
const TMJ_IRAN: EnArticle = {
  slug: "tmj-treatment-in-iran",
  keyword: "TMJ treatment in Iran",
  title: "TMJ Treatment in Iran: From Splints to Total Joint Replacement",
  excerpt:
    "TMJ treatment in Iran covers the whole ladder — splints, physiotherapy, arthrocentesis, arthroscopy and 30+ total joint replacements. See the pathway, and when surgery is right.",
  answer:
    "TMJ (temporomandibular joint) treatment in Iran follows the same staged pathway as Western centers: conservative care first — splints, physiotherapy and habit correction — then joint injections and arthrocentesis, then arthroscopy, and finally total joint replacement for the destroyed joint. Surgery is the exception, not the rule: most clicking, locking and jaw pain resolves without it. Dr. Hamed Kermani, an OMFS specialist with a craniofacial fellowship, has performed more than 30 TMJ total joint replacements and treats the full ladder in Tehran.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 9,
  fa: { href: "/blog/tmj-pain-treatment", label: "نسخه فارسی: درمان درد مفصل فک" },
  xDefaultFa: true,
  sections: [
    {
      h2: "Understanding the joint — and why it clicks",
      paras: [
        "The temporomandibular joint is the only joint in the body with a fibrocartilage disc sliding between the jaw bone and the skull. Clicking appears when the disc is displaced forward and snaps back into place during opening; locking appears when the disc blocks the movement entirely; and chronic pain can involve the disc, the joint surfaces, the muscles of mastication, or all three. Stress-related clenching and grinding (bruxism) are the most common aggravating factors, which is why treatment always starts with the muscles and habits — not the scalpel.",
      ],
    },
    {
      h2: "Stage 1 — conservative care (most patients end here)",
      paras: [
        "The first line is a custom-made occlusal splint (night guard) worn over the teeth to decompress the joint and neutralize grinding, combined with jaw physiotherapy exercises, warm compresses, a soft diet and — when indicated — short-term anti-inflammatory medication. A large share of patients with clicking, mild locking and muscular pain respond fully at this stage within weeks to a few months. Skipping this stage is the most common mistake in TMJ care, because surgery on a joint whose real problem is muscle overload fails predictably.",
      ],
    },
    {
      h2: "Stage 2 — joint procedures when conservative care is not enough",
      paras: [
        "When the joint itself remains inflamed or the disc stays displaced, the next rungs are minimally invasive: corticosteroid or hyaluronic acid injections into the joint, and arthrocentesis — washing the joint space with needles to remove inflammatory debris and free the disc. These are clinic or day-care procedures with minimal recovery. Arthroscopy, inserting a camera and instruments into the joint through a few millimetre punctures, addresses adhesions and disc problems without open surgery.",
      ],
    },
    {
      h2: "Stage 3 — open surgery and total joint replacement",
      paras: [
        "Open joint surgery is reserved for the small group with structural end-stage disease: ankylosis (bony fusion of the joint), severe degenerative arthritis, tumours, failed previous surgeries, or joints destroyed by trauma or rheumatoid disease. For these, the definitive option is a total TMJ joint replacement — a prosthetic joint that restores opening, function and facial symmetry. Dr. Kermani has performed more than 30 total joint replacements, one of the largest personal series in Iran, alongside fracture repair and reconstruction of the joint region.",
      ],
    },
    {
      h2: "How the assessment works in Tehran",
      paras: [
        "The first step is exactly the same whether you live in Tehran or abroad: a clinical examination plus imaging — panoramic X-ray, and where indicated MRI (the only study that shows the disc) or CBCT (for bone). International patients can send their MRI and X-rays on WhatsApp before travelling; the written plan states which stage of the ladder applies to you, what it costs, and what outcome is realistic. In many cases the first treatment stage can even start at home with a local dentist fabricating the splint to written specifications.",
      ],
      table: {
        head: ["Stage", "Treatment", "Typical recovery"],
        rows: [
          ["1 — Conservative", "Splint, physiotherapy, habits, medication", "Weeks to 3 months"],
          ["2 — Joint procedures", "Injections, arthrocentesis, arthroscopy", "Days to 2 weeks"],
          ["3 — Open surgery", "Disc surgery / total joint replacement", "2–6 weeks, hospital admission"],
        ],
      },
    },
  ],
  faqs: [
    {
      q: "Does TMJ clicking always need treatment?",
      a: "No. Painless clicking with full mouth opening often needs only observation and habit control. Treatment is indicated when there is pain, limited opening, locking episodes, or progressive asymmetry.",
    },
    {
      q: "Can TMJ problems come back after treatment?",
      a: "The structural correction lasts, but the driving habits — clenching and grinding — can reactivate symptoms. That is why night-guard use and physiotherapy exercises are part of long-term care, and why follow-up reviews are scheduled.",
    },
    {
      q: "Is jaw joint replacement safe and long-lasting?",
      a: "Modern TMJ prostheses are designed for lifetime function and the literature reports high long-term success. It is a hospital procedure under general anaesthesia, reserved for end-stage joints — in this practice, more than 30 replacements have been performed.",
    },
    {
      q: "Should I have my jaw 'cracked back into place' by a masseur?",
      a: "No. Forceful manipulation of a displaced disc can tear ligaments and worsen locking. Disc position is assessed with MRI and managed with graded, reversible methods first.",
    },
    {
      q: "How much does TMJ treatment cost in Iran?",
      a: "Conservative care (splint and physiotherapy) is inexpensive; injections and arthrocentesis are day-care priced; arthroscopy and joint replacement are hospital procedures quoted after imaging review. All options are given in a written plan before you commit to travel.",
    },
  ],
  related: [
    { label: "Jaw Surgery in Iran — main guide", href: "/en/jaw-surgery-in-iran" },
    { label: "Orthognathic surgery in Iran — patient journey", href: "/en/blog/orthognathic-surgery-in-iran" },
    { label: "Describe your symptoms to the surgeon", href: "/en/contact" },
  ],
};

/* ---------- ۴۹ — jaw surgery Iran medical tourism ---------- */
const MEDICAL_TOURISM: EnArticle = {
  slug: "jaw-surgery-iran-medical-tourism",
  keyword: "jaw surgery Iran medical tourism",
  title: "Traveling to Iran for Jaw Surgery: Visa, Stay, Cost and Recovery Timeline",
  excerpt:
    "A practical guide to jaw surgery medical tourism in Iran: the medical visa letter, 10–14 day Tehran stay, realistic 2026 budget lines and what follow-up looks like after you fly home.",
  answer:
    "Iran is one of the region's most active destinations for jaw surgery medical tourism: fellowship-trained maxillofacial surgeons, hospital-based surgery at 50–70% below Turkey or the Gulf, and a complete pathway built for foreigners — free online review of your X-rays, a written plan and quote before you fly, an appointment letter for the medical visa, a 10–14 day stay in Tehran for surgery and early recovery, and online follow-up after you return home. This guide walks through the practical details of that trip.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 9,
  fa: { href: "/blog/international-patients-faq", label: "نسخه فارسی: پرسش‌های بیماران خارجی" },
  xDefaultFa: false,
  sections: [
    {
      h2: "Why Iran — and why Tehran",
      paras: [
        "Iran treats one of the largest oral and maxillofacial patient populations in the region, and Tehran concentrates the highest-volume surgeons and hospitals. For jaw surgery specifically, two things matter: surgeon volume (the single strongest predictor of smooth outcomes) and a pathway that already knows how to host a foreign patient — English-speaking coordination, medical visa support, and follow-up that continues after the flight home. Dr. Kermani's practice combines both: 1,200+ jaw and facial surgeries, a craniofacial fellowship, and a dedicated international-patient line on WhatsApp.",
        "The economics are straightforward. The same operation — hospital, general anaesthesia, fellowship-trained surgeon — costs a fraction of US or UK private prices, typically 50–70% less than equivalent Turkey or Gulf packages. The saving is systemic (lower operating costs, no insurance overhead), not a discount on quality.",
      ],
    },
    {
      h2: "The visa: medical visa letter, step by step",
      paras: [
        "Most international patients enter Iran on a medical visa. The process is practical: once your surgery date is confirmed, the clinic issues an appointment and treatment letter naming the hospital and the treatment period. You submit that letter with your passport and application to the Iranian consulate or through the official e-visa portal, and the visa is typically issued within one to three weeks depending on your country. Start as soon as your date is fixed — the clinic's coordination team tells you exactly which documents your consulate expects.",
      ],
      list: [
        "Confirm surgery date with the clinic (after the online consultation)",
        "Receive the appointment/treatment letter for the medical visa",
        "Apply at the consulate or via the e-visa portal — 1 to 3 weeks typical",
        "Book flights inside the validity window; the clinic aligns the surgery date with your arrival",
      ],
    },
    {
      h2: "The 10–14 day Tehran stay, day by day",
      paras: [
        "The stay is designed so that every critical milestone happens with the surgeon present. Days 1–3: in-person examination, CBCT scan, final 3-D planning and splint fabrication, and the anesthesia pre-op. Day 4–5: surgery, with one to two nights in hospital. Days 5–10: recovery at your hotel with scheduled clinic visits — swelling peaks around day three and improves visibly from day seven; diet advances from blended to soft. Days 10–14: suture checks and the final flight-clearance review, then you fly home in the third week of healing.",
      ],
    },
    {
      h2: "Budgeting the trip beyond the surgery quote",
      paras: [
        "The surgery quote covers the medical package. The travel budget adds flights, hotel (central Tehran hotels near Keshavarz Boulevard are modestly priced by regional standards), daily food and transport — all far below Gulf or European levels — plus a companion's costs if someone travels with you. A practical rule: budget the surgery quote plus roughly 10–15% for the travel side of the trip. The clinic gives you the exact medical figure in writing first, so the travel number is the only variable left.",
      ],
    },
    {
      h2: "Language, money and staying connected",
      paras: [
        "The surgical team communicates in English, and every document you need — the plan, the quote, the discharge instructions — is provided in English. International cards do not work in Iran, so bring cash (euros or dollars are exchanged easily at official exchange offices) or arrange a tourist card through your travel agency before departure. Buy a local SIM at the airport for data and WhatsApp calls; the clinic's coordination runs entirely through WhatsApp, which works on Iranian networks.",
      ],
    },
    {
      h2: "After you fly home: follow-up and finishing orthodontics",
      paras: [
        "Healing continues under online follow-up: you send photos at set intervals, video calls replace in-person visits, and any concern is answered on the same WhatsApp line. Your local orthodontist finishes the final tooth alignment with written guidance and the surgical records from Tehran. Titanium plates are permanent and MRI-compatible in the standard sense of daily life — they do not set off scanners. The pathway ends with a final assessment around month twelve: bite, profile and function documented against the original records.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is Iran safe for medical tourists?",
      a: "Hundreds of thousands of international patients travel to Iran annually, and Tehran's medical districts operate normally for foreigners. The clinic coordinates your schedule door to door — airport arrival, hotel, hospital and follow-ups — so you are never navigating alone.",
    },
    {
      q: "Which countries do jaw-surgery patients come from?",
      a: "The practice regularly receives patients from Iraq, Oman, Afghanistan, the Gulf states and the Iranian diaspora in Europe and North America — the pathway (visa letter, English coordination, online follow-up) was built for exactly these patients.",
    },
    {
      q: "Can my companion stay with me during the hospital stay?",
      a: "Yes — companions are accommodated during the hospital admission and most patients recover at their hotel with a companion present for the first week. The clinic team structures the visit schedule around it.",
    },
    {
      q: "What if I need something urgently after flying home?",
      a: "The WhatsApp line stays open. Urgent concerns are triaged immediately by the surgeon; if local care is needed, the clinic communicates directly with your local doctor or dentist, supplying records and written guidance.",
    },
    {
      q: "How far in advance should I plan the trip?",
      a: "Four to eight weeks is comfortable: online consultation and written plan in the first week or two, visa application for one to three weeks, then travel dates. Urgent timelines are sometimes compressed — start by sending your records.",
    },
  ],
  related: [
    { label: "Jaw Surgery in Iran — main guide", href: "/en/jaw-surgery-in-iran" },
    { label: "Jaw surgery cost in Iran (2026)", href: "/en/blog/jaw-surgery-cost-in-iran" },
    { label: "Orthognathic surgery in Iran — patient journey", href: "/en/blog/orthognathic-surgery-in-iran" },
    { label: "Contact — visa letter and scheduling", href: "/en/contact" },
  ],
};

/* ---------- ۵۰ — blepharoplasty in Iran ---------- */
const BLEPH_IRAN: EnArticle = {
  slug: "blepharoplasty-in-iran",
  keyword: "blepharoplasty in Iran",
  title: "Blepharoplasty in Iran: Cost, Quality and Recovery Guide",
  excerpt:
    "Blepharoplasty in Iran combines a maxillofacial surgeon's precision with a fraction of Western prices. Upper and lower eyelid surgery, recovery calendar and the 2026 cost logic explained.",
  answer:
    "Blepharoplasty (eyelid surgery) in Iran is performed by board-certified surgeons — including oral & maxillofacial surgeons trained in the orbital region — at prices typically 50–70% below Turkey, the Gulf or Western Europe. Upper-lid surgery removes the hooded, tired fold through an incision hidden in the natural crease; lower-lid surgery removes fat bags through the crease or from inside the lid (transconjunctival). Recovery is one of the fastest in cosmetic surgery: office work at day 7–10, full social life after two weeks, and sutures out on day five.",
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  readMinutes: 8,
  fa: { href: "/blog/blepharoplasty-cost-1405", label: "نسخه فارسی: هزینه بلفاروپلاستی ۱۴۰۵" },
  xDefaultFa: false,
  sections: [
    {
      h2: "What blepharoplasty corrects",
      paras: [
        "Blepharoplasty addresses the two signs of a tired eye. In the upper lid, excess skin folds over the crease — sometimes enough to weigh on the lashes or narrow the visual field — and the correction is a skin (and occasionally muscle) excision hidden in the crease itself. In the lower lid, the fat pads that cushion the eye protrude as 'bags', with or without loose skin; the correction removes or repositions the fat through a crease incision or, in younger patients with good skin, entirely from inside the lid (transconjunctival) leaving no visible incision at all.",
        "Both procedures can be done together in one session ('quad blepharoplasty'), and both are frequently combined with other facial procedures — jaw surgery, chin surgery or a brow lift — under the same anaesthesia, which is particularly efficient for traveling patients.",
      ],
    },
    {
      h2: "Why an orbital-region surgeon matters",
      paras: [
        "The eyelid is the thinnest skin of the body overlying the orbit — a region where millimetres decide both the aesthetic outcome and eye safety. An oral & maxillofacial surgeon with craniofacial fellowship training operates on the bony orbit and periorbital region routinely; Dr. Kermani performs blepharoplasty as part of a facial-skeleton practice that also handles trauma and reconstruction of this exact anatomy. For patients combining eyelid surgery with jaw or chin procedures, one surgeon planning the whole face — rather than two specialists guessing at each other's plan — is a real quality advantage.",
      ],
    },
    {
      h2: "Recovery calendar — what to expect day by day",
      paras: [
        "Blepharoplasty recovery is short and rule-based. The first 48 hours decide most of the swelling outcome: cold compresses, head elevated above the heart, and no bending or lifting. Sutures come out on day five, bruising fades through week two, and contact lenses and eye makeup return after two weeks. Exercise resumes progressively — light walking from week two, full training after three to four weeks with the surgeon's clearance.",
      ],
      list: [
        "Day 1–2: cold compresses, head elevated, eye drops as prescribed",
        "Day 5: sutures removed at the clinic",
        "Day 7–10: office and public life (sunglasses cover any bruising)",
        "Week 2: lenses and eye makeup; bruising fully resolved",
        "Week 3–4: gym and heavy exercise after clearance",
        "Month 3: final result settled — incisions blend into the crease",
      ],
    },
    {
      h2: "Cost logic: what you pay in Iran and what is included",
      paras: [
        "Iranian pricing for blepharoplasty follows the national pattern: facility, staffing and fee levels far below the Gulf or Europe, with the same international surgical standards. The quote covers the surgeon and team, anaesthesia, the facility and follow-up visits; upper and lower lids are quoted separately so you can choose exactly the scope you want. For traveling patients the practical package is a short trip — consultation and surgery in the first days, sutures out on day five, and the flight home around day ten to fourteen if combined with another procedure.",
        "Beware of quotes that sound too good elsewhere: the meaningful comparison is scope (both lids? fat repositioning? combined procedures?), the surgeon's specialty training, and whether revision care is included. Dr. Kermani's clinic states all of it in the written plan before payment.",
      ],
    },
    {
      h2: "Candidacy and honest limits",
      paras: [
        "Good candidates have realistic goals and specific findings: excess upper-lid skin, true fat bags, good tear-film health. Patients with significant dry-eye syndrome, uncontrolled thyroid eye disease or unrealistic expectations are counselled honestly — sometimes the right answer is a brow lift instead of lid surgery, because the tired look can be caused by a drooping brow pushing skin onto the lid. The online consultation (photos front, profile and eyes-open/closed) is designed to sort this out before you travel.",
      ],
    },
  ],
  faqs: [
    {
      q: "How much does blepharoplasty cost in Iran?",
      a: "Upper and lower lids are quoted separately and the total sits at a fraction of Gulf or European prices — typically 50–70% lower. The written quote itemizes surgeon, anaesthesia, facility and follow-ups before any payment.",
    },
    {
      q: "Will there be a visible scar?",
      a: "Upper-lid incisions are hidden inside the natural crease and, once healed, blend with it; lower-lid surgery is done through the crease or entirely from inside the lid (transconjunctival) with no visible incision.",
    },
    {
      q: "How long should I stay in Iran for eyelid surgery?",
      a: "Sutures come out on day five, so a 7–10 day stay covers consultation, surgery and early recovery. Patients combining blepharoplasty with jaw or chin surgery follow the standard 10–14 day plan of the main procedure.",
    },
    {
      q: "Can blepharoplasty change my eye shape?",
      a: "The goal is a natural, rested eye — not a different eye. Incision placement and the amount of skin or fat removed are planned to preserve your lid position and ethnic lid characteristics; this is exactly what the pre-operative photos discussion settles.",
    },
    {
      q: "When is the final result visible?",
      a: "The social result is visible at week two; final refinement — softness of the scars and full settling — takes about three months. Comparing monthly photos (not daily) gives the honest picture.",
    },
  ],
  related: [
    { label: "Services — blepharoplasty (EN)", href: "/en/services" },
    { label: "Orthognathic surgery in Iran — patient journey", href: "/en/blog/orthognathic-surgery-in-iran" },
    { label: "Send photos for candidacy review", href: "/en/contact" },
  ],
};

export const EN_ARTICLES: EnArticle[] = [
  COST_IRAN,
  SURGEON_TEHRAN,
  ORTHO_JOURNEY,
  IMPLANTS_IRAN,
  ZYGOMATIC_IRAN,
  TMJ_IRAN,
  MEDICAL_TOURISM,
  BLEPH_IRAN,
];

export function getEnArticle(slug: string): EnArticle | undefined {
  return EN_ARTICLES.find((a) => a.slug === slug);
}

export const EN_ARTICLE_WA = WA;
export const EN_ARTICLE_SITE_URL = SITE.url;
