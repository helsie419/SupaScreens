#!/usr/bin/env python3
"""
Build step for the SupaScreens static site.

Source files (this directory) are the ones you edit: HTML pages link to
/assets/css/site-chrome.css and /assets/css/site-content.css normally, so
local editing/dev has normal browser caching and no duplicated CSS.

Running this script produces ./dist — a deploy-ready copy of the site with
site-chrome.css + site-content.css inlined into every page's <head>. Inlining
removes two render-blocking network requests, which is what took Lighthouse
Performance from ~90 to 100. Deploy dist/, not this source directory.

Usage:
    python3 build.py
    netlify deploy --dir=dist --prod
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

EXCLUDE_NAMES = {"dist", "build.py", ".DS_Store", "__pycache__"}

CHROME_LINK = '<link rel="stylesheet" href="/assets/css/site-chrome.css">'
CONTENT_LINK = '<link rel="stylesheet" href="/assets/css/site-content.css">'
BOTH_LINKS = f"{CHROME_LINK}\n{CONTENT_LINK}"


def copy_source_to_dist():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for item in ROOT.iterdir():
        if item.name in EXCLUDE_NAMES:
            continue
        dest = DIST / item.name
        if item.is_dir():
            shutil.copytree(item, dest, ignore=shutil.ignore_patterns(".DS_Store"))
        else:
            shutil.copy2(item, dest)


def inline_css_into_html(chrome_css: str, content_css: str) -> int:
    count = 0
    for html_path in DIST.glob("*.html"):
        text = html_path.read_text()

        if BOTH_LINKS in text:
            text = text.replace(BOTH_LINKS, f"<style>{chrome_css}\n{content_css}</style>")
        elif CHROME_LINK in text:
            text = text.replace(CHROME_LINK, f"<style>{chrome_css}</style>")
        else:
            print(f"  ! {html_path.name}: no matching stylesheet <link> found, left as-is")
            continue

        html_path.write_text(text)
        count += 1
    return count


def main():
    chrome_css = (ROOT / "assets/css/site-chrome.css").read_text()
    content_css = (ROOT / "assets/css/site-content.css").read_text()

    copy_source_to_dist()
    n = inline_css_into_html(chrome_css, content_css)

    print(f"Built dist/ — inlined CSS into {n} page(s).")
    print("Deploy with: netlify deploy --dir=dist --prod")


if __name__ == "__main__":
    main()
