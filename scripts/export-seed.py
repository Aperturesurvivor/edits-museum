#!/usr/bin/env python3
"""Build data/edits.json from the raw seed catalog (seed/edits.json, kept outside the repo).

Excludes: anything flagged high, plus posts ruled out by hand, until real screening exists.
Captions are kept in `caption` for screening/genre tagging but are NEVER rendered in the UI.
Usage: python3 scripts/export-seed.py /path/to/seed/edits.json
"""
import json, sys, os

EXCLUDE_IDS = {"2077931571911561513", "2111783641357422615"}  # hand-ruled out
HAND_KEPT_AUTHORS = {"AcidGamingGizmo", "gamblingatRicks", "HaHomestead1", "TheeDrGroyper", "engineergroypr"}

WING = {
    "Ancient Greece & Rome": "rome", "Classical art": "rome",
    "Christianity & religious art": "christendom",
    "American history & patriotism": "americana",
    "Military & war history": "military",
    "Medieval & Crusades": "medieval", "British/Anglo history & identity": "medieval",
    "World history": "history", "Maps & geopolitics": "history",
    "Film & TV": "screen", "Anime & cartoons": "screen",
    "Nature & science/space": "frontier",
    "Sports": "arena", "Gaming": "arena",
    "Political commentary": "commentary", "Meme / shitpost": "commentary",
    "Aesthetic / mood": "aesthetic",
}

src = sys.argv[1] if len(sys.argv) > 1 else "/workspace/edits-museum/seed/edits.json"
rows = json.load(open(src))
out, skipped = [], 0
for e in rows:
    if e["id"] in EXCLUDE_IDS or e.get("flag_severity") == "high":
        skipped += 1
        continue
    sev = e.get("flag_severity") or ""
    if e["author"] in HAND_KEPT_AUTHORS:
        status = "hand_kept"
    elif sev in ("review", "medium"):
        status = f"flagged_{sev}"
    else:
        status = "unscreened"
    out.append({
        "id": e["id"],
        "url": e["url"],
        "author": e["author"],
        "authorName": e.get("author_name") or e["author"],
        "caption": e.get("text") or "",          # stored for screening only, never rendered
        "createdAt": e.get("created_at_pt"),
        "likes": e.get("likes") or 0,
        "bookmarks": e.get("bookmarks") or 0,
        "views": e.get("post_impressions") or 0,
        "videoViews": e.get("video_views") or 0,
        "durationS": e.get("duration_s"),
        "mediaType": e.get("media_type"),
        "thumb": e.get("preview_image_url"),      # X CDN thumbnail, hotlinked, not re-hosted
        "width": e.get("width"), "height": e.get("height"),
        "genre": e.get("genre"),
        "wing": WING.get(e.get("genre"), "unsorted"),
        "subject": e.get("subject_note") or "",
        "status": status,
        "source": "seed:BritanniaArthur/2070961277288005994",
    })
dst = os.path.join(os.path.dirname(__file__), "..", "data", "edits.json")
json.dump(out, open(dst, "w"), indent=1, ensure_ascii=False)
print(f"wrote {len(out)} edits, skipped {skipped}")
