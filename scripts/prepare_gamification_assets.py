from pathlib import Path
from PIL import Image


ROOT = Path("/Users/roy/Downloads/gemini-game-assets")
OUT = Path("/Users/roy/Documents/ChatGPTWorkspace/english-game/assets/ui/gamification")


TARGET_SIZES = {
    "avatar-": (256, 256),
    "combo-": (640, 180),
    "fever-mode": (640, 180),
    "badge-": (160, 160),
    "fix-": (220, 160),
    "freeze-ticket": (160, 160),
    "revive-shield": (160, 160),
    "growth-tree-trunk": (180, 120),
    "growth-tree-leaf": (72, 72),
    "growth-tree-glow": (128, 128),
    "sticker-": (144, 144),
}


def pick_size(name: str) -> tuple[int, int]:
    for prefix, size in TARGET_SIZES.items():
        if name.startswith(prefix):
            return size
    return (256, 256)


def crop_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return rgba
    cropped = rgba.crop(bbox)
    pad = 8
    canvas = Image.new("RGBA", (cropped.width + pad * 2, cropped.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(cropped, (pad, pad), cropped)
    return canvas


def fit_on_canvas(image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    target_w, target_h = target_size
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    working = image.copy()
    working.thumbnail((target_w, target_h), Image.LANCZOS)
    x = (target_w - working.width) // 2
    y = (target_h - working.height) // 2
    canvas.paste(working, (x, y), working)
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src in sorted(ROOT.glob("*.png")):
        target = pick_size(src.name)
        image = Image.open(src).convert("RGBA")
        image = crop_alpha(image)
        image = fit_on_canvas(image, target)
        image.save(OUT / src.name)
        print(f"prepared\t{src.name}\t{target[0]}x{target[1]}")


if __name__ == "__main__":
    main()
