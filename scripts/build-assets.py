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

    # Roster avatar + resume photo: Rajnandini's photo, already cropped square on her face.
    photo = Image.open(SRC / "rajnandini-photo.jpg").convert("RGB")
    save_webp(photo.resize((256, 256), Image.LANCZOS), "portrait.webp", 88)
    photo.resize((320, 320), Image.LANCZOS).save(OUT / "photo-resume.jpg", quality=90)

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

    out["ursula-throne"] = Image.open(W / "ursula-throne.webp").convert("RGB")

    # Meta Quest 3 campaign: presentation slides kept whole, renders also cut into tiles
    meta = Image.open(W / "meta-final-renders.webp").convert("RGB")
    out["meta-final-renders"] = meta
    out["meta-intro-wip"] = Image.open(W / "meta-intro-wip.webp").convert("RGB")
    out["meta-room-wip"] = Image.open(W / "meta-room-wip.webp").convert("RGB")
    tiles = {
        "meta-front": (442, 90, 948, 375),
        "meta-side": (971, 90, 1477, 375),
        "meta-explode-a": (180, 398, 687, 682),
        "meta-explode-b": (707, 398, 1213, 682),
        "meta-lenses": (1233, 706, 1739, 989),
    }
    for name, box in tiles.items():
        save_webp(meta.crop(box), f"works/{name}.webp", 86)

    for name, img in out.items():
        save_webp(fit(img, 1800), f"works/{name}.webp", 84)

    # Blossom lamp: web-ready video + the last frame (full model) as a still
    import subprocess
    vid_src, vid_out = W / "blossom-lamp.mp4", OUT / "works" / "blossom-lamp.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(vid_src), "-c:v", "libx264", "-crf", "23",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "96k", str(vid_out)], check=True)
    last = OUT / "works" / "_last.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.4", "-i", str(vid_src), "-update", "1",
                    str(last)], check=True)
    lamp = Image.open(last).convert("RGB")
    last.unlink()
    save_webp(lamp, "works/blossom-lamp.webp", 88)
    print(f"  works/blossom-lamp.mp4         {vid_out.stat().st_size // 1024} KB")

    # Card thumbnails, portrait 3:5, framed on the subject
    def thumb(img, box, name):
        t = img.crop(box).resize((300, 500), Image.LANCZOS)
        save_webp(t, f"works/{name}-thumb.webp", 82)

    th = int((sb[3] - sb[1]) * 1.08)
    tw = int(th * 0.6)
    thumb(swan_src, (cx - tw // 2, cy - th // 2, cx + tw // 2, cy + th // 2), "swan")
    uw, uh = urs.size  # 1080 x 1920
    thumb(urs, (60, 260, 60 + 900, 260 + 1500), "ursula")
    lw, lh = lamp.size  # 478 x 850
    th = int(lw / 0.6)
    thumb(lamp, (0, (lh - th) // 2, lw, (lh + th) // 2), "blossom-lamp")

    # Hover "process" thumbnails: the same card flips to an earlier stage
    sculpt = out["ursula-sculpt"]
    sw2, sh2 = sculpt.size  # T-pose sits in the right third
    pw = int(sh2 * 0.6)
    thumb(sculpt, (sw2 - pw - int(sw2 * 0.04), 0, sw2 - int(sw2 * 0.04), sh2), "ursula-process")
    bdw, bdh = bd.size  # first of four stages = bare sculpt
    stage = bd.crop((0, 0, bdw // 4, bdh))
    gw, gh = stage.size
    tw2 = int(gh * 0.6)
    thumb(stage, ((gw - tw2) // 2, 0, (gw + tw2) // 2, gh), "swan-process")


def rounded(img, radius):
    """Return img with rounded corners (RGBA)."""
    from PIL import ImageDraw
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(m)
    return out


def ui_projects():
    """SOLORIZE mobile app + AC Odyssey UI study, from screens exported out of her Figma file."""
    from PIL import ImageDraw, ImageFilter
    W = SRC / "works"
    shots = [Image.open(W / "solorize" / f).convert("RGB") for f in
             ("01-login.png", "02-home.png", "03-design-my-system.png", "04-statistics.png")]

    def phone(img, h):
        # crop long screens to one phone viewport (375 x 812), then scale to height h
        vw = img.width
        vh = round(vw * 812 / 375)
        top = img.crop((0, 0, vw, min(vh, img.height)))
        top = top.resize((round(h * 375 / 812), h), Image.LANCZOS)
        return rounded(top, round(h * 0.06))

    def backdrop(w, h):
        a = np.zeros((h, w, 3), np.float32)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xx - w * .5) / (w * .55)) ** 2 + ((yy - h * .55) / (h * .7)) ** 2)
        base = np.array([13, 15, 12], np.float32)
        lime = np.array([120, 160, 30], np.float32)
        a[:] = base + lime * np.clip(1 - d, 0, 1)[..., None] ** 2 * .35
        return Image.fromarray(a.astype(np.uint8))

    # cover: four phones fanned in a row
    cw, ch = 1600, 900
    cover = backdrop(cw, ch).convert("RGBA")
    ph = 640
    phones = [phone(im, ph) for im in shots]
    gap = 48
    total = sum(p.width for p in phones) + gap * (len(phones) - 1)
    x = (cw - total) // 2
    for i, p in enumerate(phones):
        y = (ch - ph) // 2 + (0 if i in (1, 2) else 40)
        shadow = Image.new("RGBA", (p.width + 80, p.height + 80), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle((40, 50, p.width + 40, p.height + 40), radius=40, fill=(0, 0, 0, 170))
        cover.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(22)), (x - 40, y - 40))
        cover.alpha_composite(p, (x, y))
        x += p.width + gap
    save_webp(cover.convert("RGB"), "works/solorize-cover.webp", 86)

    # key screens at full length, side by side
    H = 700
    pad, gap = 70, 56
    full = [rounded(im.resize((round(im.width * H / im.height), H), Image.LANCZOS), 18) for im in shots]
    sw = sum(f.width for f in full) + gap * (len(full) - 1) + pad * 2
    sheet = backdrop(sw, H + pad * 2).convert("RGBA")
    x = pad
    for f in full:
        sheet.alpha_composite(f, (x, pad))
        x += f.width + gap
    save_webp(sheet.convert("RGB"), "works/solorize-screens.webp", 88)
    for i, name in ((1, "home"), (0, "login")):
        save_webp(shots[i], f"works/solorize-{name}.webp", 90)

    # AC Odyssey UI study
    rec = Image.open(W / "ac-ui" / "recreation.png").convert("RGB")
    save_webp(rec, "works/acui-recreation.webp", 88)
    sheet = Image.open(W / "ac-ui" / "ui-sheet.png").convert("RGB")
    save_webp(sheet, "works/acui-sheet.webp", 88)
    rw, rh = rec.size
    tw = int(rh * 0.6)
    t = rec.crop(((rw - tw) // 2, 0, (rw + tw) // 2, rh)).resize((300, 500), Image.LANCZOS)
    save_webp(t, "works/acui-thumb.webp", 84)
    sw2, sh2 = sheet.size  # inventory slot rows, framed portrait for the hover state
    t2 = sheet.crop((40, 370, 40 + 420, 370 + 700)).resize((300, 500), Image.LANCZOS)
    save_webp(t2, "works/acui-process-thumb.webp", 84)


if __name__ == "__main__":
    print("building assets ->", OUT.relative_to(ROOT))
    background()
    light = glow()
    podium(light)
    character()
    works()
    ui_projects()
