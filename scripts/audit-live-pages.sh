#!/usr/bin/env bash
# ممیزی کامل صفحات لایو dr-kermani.com — گیرانداختن خطاهای ایندکس
set -u
OUT=/home/z/my-project/docs/seo/live-audit
mkdir -p "$OUT"
BASE="https://dr-kermani.com"
SM="$OUT/sitemap-urls.txt"
REPORT="$OUT/audit-$(date +%Y%m%d-%H%M).md"

curl -s "$BASE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<\/\?loc>//g' > "$SM"
TOTAL=$(wc -l < "$SM")
echo "# ممیزی لایو $BASE — $(date '+%Y-%m-%d %H:%M')" > "$REPORT"
echo "" >> "$REPORT"
echo "کل URLهای سitemap: $TOTAL" >> "$REPORT"
echo "" >> "$REPORT"
echo "| URL | HTTP | canonical | robots | hreflang | title-len | h1 | مشکل |" >> "$REPORT"
echo "|---|---|---|---|---|---|---|---|" >> "$REPORT"

ISSUES=0
while IFS= read -r url; do
  body=$(curl -s -L --max-time 25 -A "Mozilla/5.0 (compatible; SiteAuditor/1.0)" "$url")
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "$url")
  canon=$(echo "$body" | grep -o '<link rel="canonical" href="[^"]*"' | head -1 | sed 's/.*href="//;s/"$//')
  robots=$(echo "$body" | grep -o '<meta name="robots" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"$//')
  hlang=$(echo "$body" | grep -ci 'hreflang' || true)
  title=$(echo "$body" | grep -o '<title>[^<]*</title>' | head -1 | sed 's/<\/\?title>//g')
  tlen=${#title}
  h1=$(echo "$body" | grep -o '<h1' | wc -l)
  probs=""
  [ "$code" != "200" ] && probs="$probs HTTP=$code;"
  [ -z "$canon" ] && probs="$probs no-canonical;"
  echo "$canon" | grep -q "dr-kermani.com" || [ -z "$canon" ] || probs="$probs canon-wrong-domain($canon);"
  echo "$robots" | grep -qi "noindex" && probs="$probs NOINDEX;"
  [ "$h1" -ne 1 ] && probs="$probs h1=$h1;"
  [ "$tlen" -lt 20 ] && probs="$probs short-title;"
  [ -z "$probs" ] && probs="OK"
  [ "$probs" != "OK" ] && ISSUES=$((ISSUES+1))
  echo "| $url | $code | ${canon:--} | ${robots:--} | $hlang | $tlen | $h1 | $probs |" >> "$REPORT"
done < "$SM"

echo "" >> "$REPORT"
echo "**تعداد URLهای دارای مشکل: $ISSUES از $TOTAL**" >> "$REPORT"
echo "=== REPORT SAVED: $REPORT ==="
tail -8 "$REPORT"
