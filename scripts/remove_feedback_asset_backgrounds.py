#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


TARGET_DIR = Path(__file__).resolve().parents[1] / "assets" / "ui" / "feedback"


def is_bg_pixel(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    spread = max(r, g, b) - min(r, g, b)
    is_light_bg = brightness >= 210 and spread <= 45
    is_gray_checker = 40 <= brightness <= 190 and spread <= 22
    return is_light_bg or is_gray_checker


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
        r, g, b, a = pixels[x, y]
        if a != 0:
            pixels[x, y] = (r, g, b, 0)
            removed += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and not visited[nx][ny]:
                visited[nx][ny] = True
                if is_bg_pixel(pixels[nx, ny]):
                    queue.append((nx, ny))

    return rgba, removed


def main() -> None:
    changed = 0
    for path in sorted(TARGET_DIR.glob("*.png")):
        image = Image.open(path)
        processed, removed = remove_edge_connected_background(image)
        if removed > 0:
            processed.save(path)
            changed += 1
            print(f"cleaned {path.name}: removed={removed}")
    print(f"changed={changed}")


if __name__ == "__main__":
    main()
