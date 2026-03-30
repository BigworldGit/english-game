#!/usr/bin/env python3
from __future__ import annotations

import re
from collections import deque
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[1]
GAME_JS = REPO_ROOT / "game.js"
TARGET_DIR = REPO_ROOT / "images" / "grade3"


def normalize_word_key(word: str) -> str:
    return (
        str(word)
        .lower()
        .replace("...", " ")
        .replace("(", " ")
        .replace(")", " ")
        .replace('"', "")
        .replace("'", "")
    ).strip()


def get_image_filename(word: str) -> str:
    aliases = {"t-shirt": "tshirt", "maths": "math"}
    key = normalize_word_key(word)
    key = aliases.get(key, key)
    key = key.replace("&", "and").replace("/", " ")
    key = "_".join(key.split())
    key = re.sub(r"[^a-z0-9_-]", "", key)
    if key == "im":
        key = "i_m"
    if key == "its":
        key = "it_s"
    return f"{key}.png"


def load_new_words() -> list[str]:
    text = GAME_JS.read_text(encoding="utf-8")
    match = re.search(r"const NEWLY_IMPORTED_IMAGE_WORDS = new Set\(\[(.*?)\]\);", text, re.S)
    if not match:
        raise RuntimeError("Could not find NEWLY_IMPORTED_IMAGE_WORDS in game.js")
    words = []
    for m in re.finditer(r"'([^']+)'|\"([^\"]+)\"", match.group(1)):
        words.append(m.group(1) or m.group(2))
    return words


def is_bg_pixel(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    spread = max(r, g, b) - min(r, g, b)
    return brightness >= 220 and spread <= 35


def remove_edge_connected_background(image: Image.Image) -> tuple[Image.Image, int]:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    visited = [[False] * height for _ in range(width)]
    queue: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if visited[x][y]:
            return
        visited[x][y] = True
        if is_bg_pixel(pixels[x, y]):
            queue.append((x, y))

    for x in range(width):
        try_seed(x, 0)
        try_seed(x, height - 1)
    for y in range(height):
        try_seed(0, y)
        try_seed(width - 1, y)

    removed = 0
    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        if pixels[x, y][3] != 0:
            pixels[x, y] = (r, g, b, 0)
            removed += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and not visited[nx][ny]:
                visited[nx][ny] = True
                if is_bg_pixel(pixels[nx, ny]):
                    queue.append((nx, ny))
    return rgba, removed


def main() -> None:
    total = 0
    changed = 0
    removed_pixels = 0
    for word in load_new_words():
        file_path = TARGET_DIR / get_image_filename(word)
        if not file_path.exists():
            continue
        total += 1
        image = Image.open(file_path)
        processed, removed = remove_edge_connected_background(image)
        if removed > 0:
            processed.save(file_path)
            changed += 1
            removed_pixels += removed
    print(f"processed={total}")
    print(f"changed={changed}")
    print(f"removed_pixels={removed_pixels}")


if __name__ == "__main__":
    main()
