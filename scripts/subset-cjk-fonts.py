#!/usr/bin/env python3
"""Build the small Chinese web fonts used by the homepage.

Noto Serif SC / Noto Sans SC (SIL OFL) are far too large to ship whole, so this
keeps only the characters that actually appear in index.html and writes WOFF2
files to assets/fonts/. Characters missing from the subset (for example after
you add new Chinese text) fall back to the system CJK font, so nothing breaks;
re-run this script to include them.

Requirements: python3, `pip install fonttools brotli`, and node/npm (the full
fonts are fetched once from the npm registry into a temp folder).

    python3 scripts/subset-cjk-fonts.py
"""
import re
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
OUT = ROOT / "assets" / "fonts"

# (npm package, TTF file prefix, output name, weights to build)
FONTS = [
    ("@expo-google-fonts/noto-serif-sc", "NotoSerifSC", "noto-serif-sc", {400: "400Regular", 600: "600SemiBold"}),
    ("@expo-google-fonts/noto-sans-sc", "NotoSansSC", "noto-sans-sc", {400: "400Regular", 600: "600SemiBold"}),
]

# Always keep common Chinese punctuation, in case it is added later.
EXTRA = "，。、：；？！（）《》“”‘’—…·「」『』"


def used_characters() -> str:
    html = HTML.read_text(encoding="utf-8")
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)  # ignore comments
    chars = {c for c in html if re.match(r"[　-〿一-鿿＀-￯]", c)}
    chars.update(EXTRA)
    return "".join(sorted(chars))


def fetch(package: str, tmp: Path) -> Path:
    print(f"Downloading {package} (large, one-time) ...")
    out = subprocess.run(["npm", "pack", package, "--silent"], cwd=tmp, check=True,
                         capture_output=True, text=True).stdout.strip().splitlines()[-1]
    dest = tmp / package.split("/")[-1]
    dest.mkdir(exist_ok=True)
    with tarfile.open(tmp / out) as tar:
        tar.extractall(dest)
    return dest / "package"


def main() -> int:
    text = used_characters()
    print(f"{len(text)} distinct characters")
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for package, prefix, name, weights in FONTS:
            pkg = fetch(package, tmp)
            for weight, folder in weights.items():
                src = pkg / folder / f"{prefix}_{folder}.ttf"
                opts = subset.Options()
                opts.flavor = "woff2"
                opts.layout_features = ["kern", "vert", "vrt2"]
                opts.name_IDs = [0, 1, 2, 3, 4, 6, 13, 14]  # keep copyright + license
                opts.notdef_outline = True
                font = TTFont(str(src))
                sub = subset.Subsetter(opts)
                sub.populate(text=text)
                sub.subset(font)
                dest = OUT / f"{name}-{weight}.woff2"
                subset.save_font(font, str(dest), opts)
                print(f"  {dest.relative_to(ROOT)}  {dest.stat().st_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
