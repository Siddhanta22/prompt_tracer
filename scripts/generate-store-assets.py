#!/usr/bin/env python3
"""Generate Chrome Web Store graphic assets from README screenshots and branding."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "store-assets"
ICON = ROOT / "icons" / "icon128.png"

STORE_W, STORE_H = 1280, 800
SMALL_W, SMALL_H = 440, 280
MARQUEE_W, MARQUEE_H = 1400, 560

GRADIENT_TOP = (102, 126, 234)
GRADIENT_BOTTOM = (118, 75, 162)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_bg(width, height):
    img = Image.new("RGB", (width, height))
    px = img.load()
    for y in range(height):
        color = lerp(GRADIENT_TOP, GRADIENT_BOTTOM, y / max(height - 1, 1))
        for x in range(width):
            px[x, y] = color
    return img


def fit_screenshot(src_path: Path, dest_path: Path, label: str | None = None):
    src = Image.open(src_path).convert("RGBA")
    canvas = gradient_bg(STORE_W, STORE_H)
    draw = ImageDraw.Draw(canvas)

    max_w = STORE_W - 80
    max_h = STORE_H - 120 if label else STORE_H - 60
    ratio = min(max_w / src.width, max_h / src.height)
    new_size = (int(src.width * ratio), int(src.height * ratio))
    resized = src.resize(new_size, Image.Resampling.LANCZOS)

    # Rounded card shadow
    card = Image.new("RGBA", (new_size[0] + 24, new_size[1] + 24), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((8, 8, new_size[0] + 16, new_size[1] + 16), radius=16, fill=(0, 0, 0, 60))
    card.paste(resized, (12, 12), resized)

    x = (STORE_W - card.width) // 2
    y = (STORE_H - card.height) // 2 + (20 if label else 0)
    canvas.paste(card, (x, y), card)

    if label:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
        except OSError:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), label, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((STORE_W - tw) // 2, 28), label, fill=(255, 255, 255), font=font)

    canvas.save(dest_path, "PNG", optimize=True)
    print(f"Wrote {dest_path}")


def promo_tile(width, height, dest_path: Path, headline: str, subline: str):
    img = gradient_bg(width, height)
    draw = ImageDraw.Draw(img)

    icon = Image.open(ICON).convert("RGBA")
    icon_size = min(height - 40, 96) if width < 600 else 128
    icon = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    img.paste(icon, (24, (height - icon_size) // 2), icon)

    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32 if width < 600 else 44)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16 if width < 600 else 22)
    except OSError:
        title_font = ImageFont.load_default()
        sub_font = title_font

    text_x = 24 + icon_size + 20
    draw.text((text_x, height // 2 - 42), headline, fill=(255, 255, 255), font=title_font)
    draw.text((text_x, height // 2 + 4), subline, fill=(240, 240, 255), font=sub_font)

    # Feature chips (marquee only)
    if width >= 1000:
        chips = ["6 Metrics", "Privacy-first", "ChatGPT · Claude · Grok · Gemini"]
        cx = text_x
        cy = height // 2 + 48
        for chip in chips:
            bbox = draw.textbbox((0, 0), chip, font=sub_font)
            cw, ch = bbox[2] - bbox[0] + 24, bbox[3] - bbox[1] + 12
            draw.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=12, fill=(180, 190, 255))
            draw.text((cx + 12, cy + 4), chip, fill=(255, 255, 255), font=sub_font)
            cx += cw + 12

    img.save(dest_path, "PNG", optimize=True)
    print(f"Wrote {dest_path}")


def main():
    OUT.mkdir(exist_ok=True)

    raw1 = OUT / "screenshot-raw-1.png"
    raw2 = OUT / "screenshot-raw-2.png"

    if raw1.exists():
        fit_screenshot(raw1, OUT / "screenshot-1-analysis.png", "Real-time prompt analysis")
    if raw2.exists():
        fit_screenshot(raw2, OUT / "screenshot-2-dashboard.png", "Analytics dashboard")

    # Duplicate with alternate framing if only two raws
    if raw1.exists():
        fit_screenshot(raw1, OUT / "screenshot-3-optimization.png", "Smart prompt optimization")

    promo_tile(SMALL_W, SMALL_H, OUT / "promo-small-440x280.png", "Prompt Tracer", "AI prompt optimizer")
    promo_tile(MARQUEE_W, MARQUEE_H, OUT / "promo-marquee-1400x560.png", "Prompt Tracer", "Write better prompts on every AI platform")

    print("\nUpload from:", OUT)


if __name__ == "__main__":
    main()
