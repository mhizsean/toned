#!/usr/bin/env python3
"""Generate TONED splash, app icon, and adaptive icon assets."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / ".asset-tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
FONT_PATH = Path(__file__).resolve().parent / "BebasNeue-Regular.ttf"

AMBER = "#f59e0b"
BACKGROUND = "#080808"
WORDMARK = "TONED"


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), size)


def measure_spaced_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    tracking: int,
) -> tuple[int, int]:
    width = 0
    max_height = 0
    for index, char in enumerate(text):
        bbox = draw.textbbox((0, 0), char, font=font)
        char_width = bbox[2] - bbox[0]
        char_height = bbox[3] - bbox[1]
        width += char_width + (tracking if index < len(text) - 1 else 0)
        max_height = max(max_height, char_height)
    return width, max_height


def draw_spaced_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> None:
    x, y = xy
    for index, char in enumerate(text):
        draw.text((x, y), char, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), char, font=font)
        x += (bbox[2] - bbox[0]) + (tracking if index < len(text) - 1 else 0)


def fit_font_size(
    draw: ImageDraw.ImageDraw,
    target_width: int,
    tracking_ratio: float = 0.08,
) -> tuple[ImageFont.FreeTypeFont, int]:
    size = 200
    while size > 20:
        font = load_font(size)
        tracking = max(2, int(size * tracking_ratio))
        width, _ = measure_spaced_text(draw, WORDMARK, font, tracking)
        if width <= target_width:
            return font, tracking
        size -= 2
    font = load_font(20)
    return font, max(2, int(20 * tracking_ratio))


def render_wordmark(
    canvas_size: int,
    *,
    background: str | None,
    max_text_width_ratio: float = 0.78,
) -> Image.Image:
    mode = "RGBA" if background is None else "RGB"
    image = Image.new(mode, (canvas_size, canvas_size), background)
    draw = ImageDraw.Draw(image)

    target_width = int(canvas_size * max_text_width_ratio)
    font, tracking = fit_font_size(draw, target_width)
    text_width, text_height = measure_spaced_text(draw, WORDMARK, font, tracking)

    x = (canvas_size - text_width) // 2
    y = (canvas_size - text_height) // 2 - int(canvas_size * 0.02)
    draw_spaced_text(draw, (x, y), WORDMARK, font, AMBER, tracking)
    return image


def main() -> None:
    if not FONT_PATH.exists():
        raise SystemExit(f"Missing font file: {FONT_PATH}")

    ASSETS.mkdir(parents=True, exist_ok=True)

    splash = render_wordmark(1024, background=None, max_text_width_ratio=0.82)
    splash.save(ASSETS / "splash-icon.png", optimize=True)

    icon = render_wordmark(1024, background=BACKGROUND, max_text_width_ratio=0.72)
    icon.save(ASSETS / "icon.png", optimize=True)

    adaptive = render_wordmark(1024, background=None, max_text_width_ratio=0.58)
    adaptive.save(ASSETS / "adaptive-icon.png", optimize=True)

    favicon = render_wordmark(48, background=BACKGROUND, max_text_width_ratio=0.82)
    favicon.save(ASSETS / "favicon.png", optimize=True)

    print("Generated branded assets in assets/")


if __name__ == "__main__":
    main()
