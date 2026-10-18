#!/usr/bin/env python3
"""Build data/edits.json from the raw catalogs (kept outside the repo).

Inputs:
  seed/edits.json        batch 1: replies/quotes to @BritanniaArthur/2070961277288005994
  seed/edits_more.json   batch 2: genre searches on X
  variants.json          MP4 variant URLs from X (video.twimg.com), fetched via public post reads
  approved.json          hand-screened edits Josiah approved (status approved_by_josiah), already in app shape

Excluded until automated screening exists: anything flagged high, NSFW-flagged, non-edit-flagged,
X `possibly_sensitive`, and posts ruled out by hand.
Captions are kept in `caption` for screening/genre tagging but are NEVER rendered in the UI.
Video is never downloaded or re-hosted: we store X's CDN URLs and stream them in <video>.

Usage: python3 scripts/export-seed.py SEED_DIR VARIANTS_JSON [APPROVED_JSON]
"""
import json, os, sys

EXCLUDE_IDS = {"2077931571911561513", "2111783641357422615"}  # hand-ruled out
HAND_KEPT_AUTHORS = {"AcidGamingGizmo", "gamblingatRicks", "HaHomestead1", "TheeDrGroyper", "engineergroypr"}

WING = {
    # batch 1 genres
    "Ancient Greece & Rome": "rome", "Classical art": "rome",
    "Christianity & religious art": "christendom",
    "American history & patriotism": "americana",
    "Military & war history": "military",
    "Medieval & Crusades": "medieval", "British/Anglo history & identity": "medieval",
    "World history": "history", "Maps & geopolitics": "history",
    "Film & TV": "screen", "Anime & cartoons": "screen", "Gaming": "screen",
    "Nature & science/space": "frontier",
    "Sports": "arena",
    "Political commentary": "commentary", "Meme / shitpost": "commentary",
    "Aesthetic / mood": "aesthetic",
    # batch 2 genres
    "Rome & antiquity": "rome", "Greece": "rome",
    "Christendom & cathedrals": "christendom",
    "Americana": "americana",
    "Medieval & knights": "medieval", "Vikings & Norse": "medieval",
    "Military history": "military", "Military aviation": "military",
    "History & empires": "history",
    "Space & rockets": "frontier", "Nature & national parks": "frontier",
    "Engineering & megaprojects": "builders", "Architecture": "builders",
    "F1 & motorsport": "motorsport", "Cars": "motorsport",
    "Sports: soccer": "arena", "Sports: combat": "arena", "Sports: NFL/American football": "arena",
    "Sports: NBA/basketball": "arena", "Sports: other": "arena",
    "Anime": "screen",
    "Fandom: music & celebs": "aesthetic",
    "General / mixed": "unsorted",
}

seed_dir = sys.argv[1] if len(sys.argv) > 1 else "/workspace/edits-museum/seed"
variants = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "/workspace/em/variants/variants.json"))["variants"]

def status_for(e):
    sev = e.get("flag_severity") or ""
    if e["author"] in HAND_KEPT_AUTHORS:
        return "hand_kept"
    if sev in ("review", "medium"):
        return f"flagged_{sev}"
    return "unscreened"

def excluded(e):
    ft = e.get("flag_type") or ""
    return (e["id"] in EXCLUDE_IDS or e.get("flag_severity") == "high" or "nsfw" in ft
            or "non-edit" in ft or e.get("possibly_sensitive"))

approved_path = sys.argv[3] if len(sys.argv) > 3 else "/workspace/em/variants/approved.json"
approved = json.load(open(approved_path)) if os.path.exists(approved_path) else []
out, seen, skipped = list(approved), {a["id"] for a in approved}, 0
for fname, source in (("edits.json", "seed:BritanniaArthur/2070961277288005994"), ("edits_more.json", "x-search")):
    for e in json.load(open(os.path.join(seed_dir, fname))):
        if e["id"] in seen:
            continue
        if excluded(e):
            skipped += 1
            continue
        seen.add(e["id"])
        v = variants.get(e["id"])
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
            "thumb": (v or {}).get("poster") or e.get("preview_image_url"),  # X CDN, hotlinked
            "width": (v or {}).get("w") or e.get("width"),
            "height": (v or {}).get("h") or e.get("height"),
            "video": {"hi": v["hi"], "lo": v.get("lo")} if v else None,     # X CDN MP4s, streamed, never re-hosted
            "genre": e.get("genre"),
            "wing": WING.get(e.get("genre"), "unsorted"),
            "subject": e.get("subject_note") or "",
            "status": status_for(e),
            "source": source if source != "x-search" else f"x-search:{e.get('source_query', '')}",
        })

root = os.path.join(os.path.dirname(__file__), "..", "data")
# Captions stay out of the public repo: they're only needed for screening, which runs privately.
os.makedirs(os.path.join(root, "private"), exist_ok=True)
json.dump({e["id"]: e["caption"] for e in out}, open(os.path.join(root, "private", "captions.json"), "w"), ensure_ascii=False)
for e in out:
    e["caption"] = ""
json.dump(out, open(os.path.join(root, "edits.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(f"wrote {len(out)} edits ({sum(1 for x in out if x['video'])} with video), skipped {skipped}")
