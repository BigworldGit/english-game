#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path("/Users/roy/Documents/ChatGPTWorkspace/english-game")
INPUT_JSON = ROOT / "image-audit" / "current-playable-words.json"
THUMB_ROOT = ROOT / "image-audit" / "thumbs"
THUMB_SIZE = (256, 256)


def main() -> None:
    data = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    items = data.get("items", [])
    seen = set()

    for item in items:
        image = item.get("image", "")
        if not image.startswith("/images/"):
            continue
        relative = image.removeprefix("/")
        source_path = ROOT / relative
        thumb_path = THUMB_ROOT / relative.removeprefix("images/")
        item["thumbnail"] = "/" + str(thumb_path.relative_to(ROOT)).replace("\\", "/")

        if relative in seen:
            continue
        seen.add(relative)

        if not source_path.exists():
            continue

        thumb_path.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source_path) as image_obj:
            image_obj.load()
            if image_obj.mode not in ("RGBA", "LA"):
                image_obj = image_obj.convert("RGBA")
            else:
                image_obj = image_obj.copy()
            image_obj.thumbnail(THUMB_SIZE, Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", THUMB_SIZE, (0, 0, 0, 0))
            offset = (
                (THUMB_SIZE[0] - image_obj.size[0]) // 2,
                (THUMB_SIZE[1] - image_obj.size[1]) // 2,
            )
            canvas.alpha_composite(image_obj, offset)
            canvas.save(thumb_path, format="PNG", optimize=True)

    INPUT_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
