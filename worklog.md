# Worklog

---
Task ID: 4
Agent: main
Task: Add doctor's portfolio file (Downloads.rar) + certificates + old logo + remaining dromfs content

Work Log:
- First upload (build-btc6 zip) was wrong file (BTC prediction app, no images); user sent Downloads.rar
- Extracted 38 JPGs -> 31 unique (md5 dedupe); classified by watermark: 15 covers = Dr. Kermani (skull logo), 16 = Dr. Pedram Bakhshaie (S logo) -> EXCLUDED Pedram's to avoid credit misattribution
- Downloaded 23 missing dromfs.com images via wsrv.nl proxy (11 framed certificates IMG_6500-6519, surgery/clinic photos DSC_0476, ghjDSC_0416, portraits, 6 educational case posts)
- Processed all: covers 810x1440 q80 -> public/images/covers/ (15), certificates 1100px q85 -> public/images/certificates/ (11), clinic -> public/images/clinic/ (4), cases -> public/images/cases/ (6)
- data.ts: added PORTFOLIO_COVERS (15), CERTIFICATES (11 with Persian titles), extended GALLERY_CASES (+9), GALLERY_CATS (+جراحی های داخل دهان، کلینیک و اتاق عمل)
- About page: new "مدارک و گواهینامه ها" section (3-col grid, keyboard-accessible, lightbox with max-h 78vh)
- Gallery page: new "کاور نمونه کارها" horizontal 9:16 scroll strip + lightbox; fixed lightbox for portrait images (max-h 80vh)
- Logo: generated favicon set (32/48/192/512/apple) from old logo.png; metadata.icons added; navbar/footer logo now object-cover badge (skull visible, no white circle)
- Fixed pre-existing TS error in cinematic.tsx (mode="wait" on motion.main)
- Verified: tsc src clean, eslint clean, certificates render (11), covers strip + lightbox OK, clinic filter (4 items), mobile 390px OK, favicon links in HTML, zero console errors

Stage Summary:
- All doctor's portfolio covers (his watermark only) live in gallery
- Certificates section restored (was on old site's about page, missing from rebuild)
- Old logo now favicon + clean circular badge in navbar/footer
- Remaining dromfs content (clinic photos, educational posts) transferred

---
Task ID: 3
Agent: main
Task: Remove film-grain (برفک/static) effect from site

Work Log:
- User reported برفک (TV-static noise) on site — it was the cinematic film-grain overlay (.film-grain::after with SVG feTurbulence fractalNoise + grain keyframes)
- Removed .film-grain::after block and @keyframes grain from src/app/globals.css; cleaned its reference in prefers-reduced-motion block
- Removed film-grain class from root div in src/components/app-shell.tsx
- Verified via grep: zero grain/noise/feTurbulence references remain in src/
- Verified in browser: ::after content is none, homepage screenshot clean, no console errors

Stage Summary:
- Film-grain static effect fully removed from all pages; all other cinematic effects (Ken Burns, parallax, reveals, marquee, counters) retained

---
Task ID: 2
Agent: main
Task: Build new Next.js website for Dr. Hamed Kermani (dromfs.com redesign)

Work Log:
- Initialized fullstack-dev scaffold (Next.js 16, Tailwind 4, shadcn/ui, Prisma/SQLite)
- Downloaded Vazirmatn font family (7 weights) to public/fonts
- Copied 28 original photos to public/images
- Built design system: ink/bone/surgical-teal palette, RTL, Vazirmatn, film-grain + Ken Burns + spotlight sweep cinematic utilities (globals.css)
- Created src/lib/data.ts with ALL transferred content: bio, education, stats, services, costs (jaw + implant), team, hours, FAQ, blog posts, contact info
- Built hash router (preview-safe SPA routing) with 7 pages: home, about, services, costs, gallery, blog, contact
- Cinematic components: ScrollProgress, Reveal (blur+rise), LineReveal (staggered clip reveal), Counter (Persian digits), Parallax, PageTransition, Marquee
- Interactive BeforeAfter drag/keyboard slider component
- Homepage standard structure: cinematic hero -> stats marquee -> about teaser -> services -> before/after -> success rates -> team -> FAQ -> CTA
- SEO: metadata (OG/Twitter/keywords/canonical/geo tags), JSON-LD (Physician, WebSite, FAQPage, MedicalProcedure ItemList), semantic HTML, image alts
- GEO: public/llms.txt + public/llms-full.txt
- AEO: FAQPage schema, question-based headings, direct answers
- robots.txt (allows AI crawlers) + sitemap.xml
- Contact form -> /api/contact (Prisma ContactMessage model, zod validation) - tested OK
- Verified via agent-browser: desktop + mobile (390px), nav pill, mobile menu, slider keyboard interaction (50->38), FAQ accordion, gallery filters, form API; zero console errors; lint clean

Stage Summary:
- New site fully built and running on port 3000
- All original dromfs.com content transferred and restructured into standard multi-page layout
- Cinematic motion system implemented (Ken Burns, parallax, clip reveals, counters, marquee, film grain, page transitions)
- SEO/GEO/AEO files: layout metadata + 4 JSON-LD schemas + llms.txt + llms-full.txt + robots.txt + sitemap.xml

---
Task ID: 1
Agent: main
Task: Install requested GitHub skills + extract dromfs.com content

Work Log:
- Cloned 8 repos into /home/z/my-project/skills/: taste-skill-plugin, impeccable, playwright-cli, awesome-design-md, img2threejs, ui-ux-pro-max-skill, claude-seo, anthropics-skills
- Extracted dromfs.com content via z-ai page_reader (direct curl blocked, dromfs geo-blocked)
- Fetched pages: home, about, services, gallery, contact, blog
- Downloaded 28 real images via wsrv.nl proxy to /home/z/my-project/scripts/dromfs_images/

Stage Summary:
- Site owner: دکتر حامد کرمانی (Dr. Hamed Kermani), OMFS specialist + craniofacial fellowship (Mashhad Univ, Tehran Univ)
- Key data: 16+ years experience, stats (1067 jaw surgeries, 248 chin corrections, 347 bone grafts, 5000 implants, 93%/97%/90% success)
- Services: جراحی یک فک، دو فک، بلفاروپلاستی، جنیوپلاستی، ایمپلنت، بازسازی فک
- Costs: jaw surgeries 90-240M tomans, implants 24-110M/unit
- Team: دکتر فاطمه رستم خانی (prosthodontist), منیره کاظمی (supervisor), پوریا هاشم پور (content)
- Contact: 02166921500, WhatsApp 09382080270, بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر، طبقه ۳ واحد ۱۲
- Hours: Sat/Mon (Dr. Rostamkhani), Sun/Tue/Wed (Dr. Kermani), 15:00-19:00, Thu-Fri closed
- Social: instagram.com/dr.hamedkermani.omfs, aparat.com/dromfs
- Academic: DDS Mashhad 1382, OMFS residency Mashhad 1389, Craniofacial fellowship Tehran 1397, assistant professor Beheshti 1391-94, Mashhad 1394-96, Nodoon high school grad, experience in Belgium/Germany/China
- Blog posts: 18 Google Scholar articles, recovery after wisdom tooth surgery, wisdom tooth root-nerve connection
- Content files in /home/z/my-project/scripts/dromfs_*_text.txt
- Images in /home/z/my-project/scripts/dromfs_images/
