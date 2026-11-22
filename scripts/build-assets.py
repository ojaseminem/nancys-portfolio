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
(OUT / "works").mkdir(exist_ok=True)


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
    return col_img


def podium(light):
    """Cut the painted pedestal out of the background as its own layer.

    It moves together with the character in the parallax, so she always stays
    grounded on it. The light column is baked in (at its average strength) so
    the cut-out matches the lit background around it. Edges are feathered and
    slightly oversized so the painted pedestal underneath never peeks out.
    """
    bg = np.asarray(Image.open(SRC / "background.webp").convert("RGB")).astype(np.float32) / 255.0
    li = np.asarray(light).astype(np.float32) / 255.0 * 0.85
    lit = 1 - (1 - bg) * (1 - li)  # screen blend
    h, w = lit.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # The pedestal drum is the top of a wide ellipse centred below the frame.
    cx, cy, a, b = 900.0, 1200.0, 735.0, 212.0
    d = np.sqrt(((xx - cx) / a) ** 2 + ((yy - cy) / b) ** 2)
    alpha = np.clip((1.0 - d) / 0.07, 0, 1)
    rgba = np.dstack([lit, alpha])
    box = (150, 970, 1650, 1125)  # 1500 x 155 in master space
    img = Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").crop(box)
    save_webp(img, "podium.webp", 84)


def character():
    c = Image.open(SRC / "character.webp").convert("RGBA")
    c = c.crop(c.getbbox())
    save_webp(c, "character-2000.webp", 86)
    w, h = c.size
    save_webp(c.resize((round(w * 1200 / h), 1200), Image.LANCZOS), "character-1200.webp", 84)

    # Portrait for the roster avatar: square crop centred on the face
    # (nose at roughly x=503 in master space) so it sits centred in the circle.
    src = Image.open(SRC / "character.webp").convert("RGBA")
    head = src.crop((353, 0, 653, 300))
    bg = Image.new("RGBA", head.size, (58, 36, 72, 255))
    bg.alpha_composite(head)
    save_webp(bg.convert("RGB").resize((256, 256), Image.LANCZOS), "portrait.webp", 86)

    # Soft silhouette used for the "rim light" behind the character
    alpha = c.split()[3].resize((round(w * 600 / h), 600), Image.LANCZOS)
    rim = Image.new("RGBA", alpha.size, (255, 214, 170, 0))
    rim.putalpha(alpha.filter(ImageFilter.GaussianBlur(14)))
    save_webp(rim, "character-rim.webp", 70)


def content_box(img, bg, tol=18, pad=0.04, exclude_below=None):
    """Bounding box of everything that differs from the flat backdrop colour, padded."""
    a = np.asarray(img.convert("RGB")).astype(int)
    if exclude_below:
        a = a[:exclude_below]
    mask = (np.abs(a - np.array(bg)).max(axis=2) > tol)
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    px, py = int((x1 - x0) * pad), int((y1 - y0) * pad)
    return (max(0, x0 - px), max(0, y0 - py), min(img.width, x1 + px), min(img.height, y1 + py))


def fit(img, longest):
    w, h = img.size
    s = longest / max(w, h)
    return img if s >= 1 else img.resize((round(w * s), round(h * s)), Image.LANCZOS)


def works():
    """Portfolio pieces: trimmed, straightened, exported as full-size + card thumbnail."""
    W = SRC / "works"
    out = {}
    # Swan lotus relief
    swan_src = Image.open(W / "swan-final.webp").convert("RGB")
    sb = content_box(swan_src, (36, 36, 36), pad=0.0)
    cx, cy = (sb[0] + sb[2]) // 2, (sb[1] + sb[3]) // 2
    hh = int((sb[3] - sb[1]) * 0.56)  # roomy portrait frame around the relief
    hw = int(hh * 0.75)
    swan = swan_src.crop((cx - hw, max(0, cy - hh), cx + hw, min(swan_src.height, cy + hh)))
    out["swan-final"] = swan
    bd = Image.open(W / "swan-breakdown.webp").convert("RGB")
    bb = content_box(bd, (36, 36, 36), pad=0.03, exclude_below=870)
    bd = bd.crop((bb[0], bb[1], bb[2], min(bb[3], 872)))  # drop the "Breakdown" label
    out["swan-breakdown"] = bd
    # Ursula: the render was supplied rotated 90 degrees anticlockwise
    urs = Image.open(W / "ursula-render-raw.webp").convert("RGB").rotate(-90, expand=True)
    out["ursula-render"] = urs
    topo = Image.open(W / "ursula-topology.webp").convert("RGB")
    out["ursula-topology"] = topo.crop(content_box(topo, (35, 35, 35), pad=0.015))
    sculpt = Image.open(W / "ursula-sculpt.png").convert("RGB")
    out["ursula-sculpt"] = sculpt.crop(content_box(sculpt, (48, 48, 48), pad=0.015))

    for name, img in out.items():
        save_webp(fit(img, 1800), f"works/{name}.webp", 84)

    # Card thumbnails, portrait 3:5, framed on the subject
    def thumb(img, box, name):
        t = img.crop(box).resize((300, 500), Image.LANCZOS)
        save_webp(t, f"works/{name}-thumb.webp", 82)

    th = int((sb[3] - sb[1]) * 1.08)
    tw = int(th * 0.6)
    thumb(swan_src, (cx - tw // 2, cy - th // 2, cx + tw // 2, cy + th // 2), "swan")
    uw, uh = urs.size  # 1080 x 1920
    thumb(urs, (60, 260, 60 + 900, 260 + 1500), "ursula")


if __name__ == "__main__":
    print("building assets ->", OUT.relative_to(ROOT))
    background()
    light = glow()
    podium(light)
    character()
    works()
