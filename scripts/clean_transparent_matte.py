#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, UnidentifiedImageError


ROOT = Path("/Users/roy/Documents/ChatGPTWorkspace/english-game/images")


def is_checker_matte(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a < 180:
        return False
    spread = max(r, g, b) - min(r, g, b)
    brightness = (r + g + b) / 3
    return spread <= 14 and 150 <= brightness <= 248


def clean_image(path: Path) -> tuple[bool, int]:
    try:
        image = Image.open(path).convert("RGBA")
    except (UnidentifiedImageError, OSError):
        return False, 0
    pixels = image.load()
    width, height = image.size
    changed = 0
    to_clear: list[tuple[int, int]] = []

    for y in range(1, height - 1):
        for x in range(1, width - 1):
            px = pixels[x, y]
            if not is_checker_matte(px):
                continue
            neighbors = [
                pixels[x - 1, y],
                pixels[x + 1, y],
                pixels[x, y - 1],
                pixels[x, y + 1],
                pixels[x - 1, y - 1],
                pixels[x + 1, y - 1],
                pixels[x - 1, y + 1],
                pixels[x + 1, y + 1],
            ]
            transparent_neighbors = sum(1 for n in neighbors if n[3] <= 8)
            if transparent_neighbors >= 2:
                to_clear.append((x, y))

    for x, y in to_clear:
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        changed += 1

    if changed:
        image.save(path)
        return True, changed
    return False, 0


def main() -> None:
    changed_files = 0
    changed_pixels = 0
    for path in sorted(ROOT.rglob("*.png")):
        changed, count = clean_image(path)
        if changed:
            changed_files += 1
            changed_pixels += count
            print(f"cleaned\t{path.relative_to(ROOT)}\t{count}")
    print(f"changed_files={changed_files}")
    print(f"changed_pixels={changed_pixels}")


if __name__ == "__main__":
    main()
