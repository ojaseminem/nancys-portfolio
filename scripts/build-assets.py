#!/usr/bin/env python3
"""Builds the optimised web assets in public/assets from the master art in source-art/.

Run with:  npm run assets   (needs Python 3 + Pillow + numpy)

Masters:
  source-art/background.webp  2000x1125  painted sky / temple scene
  source-art/glow.webp        2000x1125  RGBA light pass (orb sigil + light column + pedestal)
  source-art/character.webp   1124x2000  RGBA character render
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source-art"
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def save_webp(img, name, quality=82):
    path = OUT / name
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"  {name:28s} {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


def background():
    bg = Image.open(SRC / "background.webp").convert("RGB")
    save_webp(bg, "bg-2000.webp", 80)
    save_webp(bg.resize((1280, 720), Image.LANCZOS), "bg-1280.webp", 78)
    # tiny blurred placeholder shown while the full image streams in
    save_webp(bg.resize((48, 27), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1)), "bg-lqip.webp", 60)


def glow():
    """Turn the RGBA light pass into two additive (screen-blend) layers.

    light-column: the soft pink column + pedestal bounce, no orb.
    orb: the gold sigil orb on its own so it can pulse and turn independently.
    """
    g = Image.open(SRC / "glow.webp").convert("RGBA")
    a = np.asarray(g).astype(np.float32) / 255.0
    rgb = a[..., :3] * a[..., 3:4]  # composite over black -> additive light
    h, w = rgb.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # The orb sits at roughly (842, 300) in master space.
    cx, cy = 842.0, 300.0
    r = np.hypot(xx - cx, yy - cy)

    # --- orb layer ------------------------------------------------------
    orb_mask = np.clip((300 - r) / 60.0, 0, 1)
    orb = rgb * orb_mask[..., None]
    # lift the gold filigree, sink the flat grey disc so it reads as light
    lum = orb.mean(axis=2, keepdims=True)
    orb = np.clip((orb - 0.18) * 1.6, 0, 1) * np.clip(lum * 1.4, 0, 1) ** 0.2
    box = (cx - 300, cy - 300, cx + 300, cy + 300)
    orb_img = Image.fromarray((orb * 255).astype(np.uint8), "RGB").crop(tuple(int(v) for v in box))
    save_webp(orb_img, "orb.webp", 85)

    # --- light column ---------------------------------------------------
    # remove the flat grey sky band and the orb, keep the pink column.
    col = rgb.copy()
    floor = np.array([0.30, 0.28, 0.30], dtype=np.float32)
    col = np.clip(col - floor * (yy < 560)[..., None] * np.clip((560 - yy) / 260.0, 0, 1)[..., None], 0, 1)
    col *= (1 - orb_mask * 0.95)[..., None]
    horiz = np.exp(-((xx - 880) / 520.0) ** 2)
    col *= horiz[..., None]
    # slightly warmer, rosier light
    col *= np.array([1.05, 0.92, 1.0], dtype=np.float32)
    col_img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8), "RGB")
    save_webp(col_img.resize((1280, 720), Image.LANCZOS), "light-column.webp", 80)


def character():
    c = Image.open(SRC / "character.webp").convert("RGBA")
    c = c.crop(c.getbbox())
    save_webp(c, "character-2000.webp", 86)
    w, h = c.size
    save_webp(c.resize((round(w * 1200 / h), 1200), Image.LANCZOS), "character-1200.webp", 84)

    # Portrait for the roster / favicon-ish avatar: crop the head.
    src = Image.open(SRC / "character.webp").convert("RGBA")
    head = src.crop((410, 10, 730, 330))
    bg = Image.new("RGBA", head.size, (58, 36, 72, 255))
    bg.alpha_composite(head)
    save_webp(bg.convert("RGB").resize((256, 256), Image.LANCZOS), "portrait.webp", 86)

    # Soft silhouette used for the "rim light" behind the character
    alpha = c.split()[3].resize((round(w * 600 / h), 600), Image.LANCZOS)
    rim = Image.new("RGBA", alpha.size, (255, 214, 170, 0))
    rim.putalpha(alpha.filter(ImageFilter.GaussianBlur(14)))
    save_webp(rim, "character-rim.webp", 70)


if __name__ == "__main__":
    print("building assets ->", OUT.relative_to(ROOT))
    background()
    glow()
    character()
