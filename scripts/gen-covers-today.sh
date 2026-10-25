#!/bin/bash
# تولید ۱۰ کاور 3D مقالات امروز — سبک اختصاصی سایت: زمینه تیره Laki + طلایی
DIR="/home/z/my-project/public/images/agent"
STYLE="premium 3D medical illustration render, dark charcoal matte background, warm golden metallic accents, soft studio lighting, clean minimal composition, high-end dental clinic branding, photorealistic octane render, high quality, detailed, no text, no words, no letters"

declare -A PROMPTS=(
  ["jaw-surgery-cost-1405"]="elegant 3D human jaw bone model with titanium plates beside golden coins stack and a transparent glass price tag, $STYLE"
  ["dental-implant-cost-1405"]="3D dental implant titanium screw with ceramic crown next to golden currency coins and a small gold calculator, $STYLE"
  ["jaw-surgery-nutrition"]="3D smoothie bowl with soft healthy food, spoon and a translucent human jaw bone model behind, protein shake glass, $STYLE"
  ["jaw-surgery-sleeping"]="3D cozy pillow stack with elevated head position, soft night atmosphere, crescent moon light, sleeping mask, $STYLE"
  ["lefort-osteotomy-guide"]="3D human skull upper jaw maxilla model with horizontal osteotomy cut line highlighted in glowing gold and surgical titanium mini plates, $STYLE"
  ["bsso-lower-jaw-surgery"]="3D human lower jaw mandible bone model with sagittal split osteotomy lines and four titanium fixation plates and screws, $STYLE"
  ["all-on-4-implants-guide"]="3D full dental arch prosthesis supported by four angled titanium implants, cross section gum view, golden glowing highlights, $STYLE"
  ["jaw-surgery-without-orthodontics"]="3D jaw bone model with orthodontic braces brackets on teeth and a subtle glowing question mark silhouette made of gold wire above, $STYLE"
  ["dental-implant-complications"]="3D dental implant cross section inside gum and bone with protective transparent shield barrier and tiny warning glow, $STYLE"
  ["jaw-surgery-consultation-checklist"]="3D golden clipboard with floating checklist items and a human jaw bone model, doctor desk scene, $STYLE"
)

for slug in "$@"; do
  if [ -f "$DIR/$slug.png" ]; then echo "skip $slug (exists)"; continue; fi
  echo "→ generating $slug ..."
  z-ai image -p "${PROMPTS[$slug]}" -o "$DIR/$slug.png" -s 1344x768 >/dev/null 2>&1 && echo "  ✓ $slug" || echo "  ✗ $slug FAILED"
done
echo "done."
