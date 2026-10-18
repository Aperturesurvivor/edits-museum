#!/usr/bin/env python3
"""Write review/catalog.json for the Colab review notebook: ids + media URLs only (no captions), plus wing prototypes."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from prompts import WING_DESCRIBE, WING_PROMPTS

root = os.path.join(os.path.dirname(__file__), "..", "..")
edits = json.load(open(os.path.join(root, "data", "edits.json")))
edits.sort(key=lambda e: -(e.get("likes", 0) + 2 * e.get("bookmarks", 0)))  # most visible first
out = {
    "version": 1,
    "wings": [{"slug": k, "describe": WING_DESCRIBE[k], "prototypes": v} for k, v in WING_PROMPTS.items()],
    "edits": [{
        "id": e["id"], "author": e["author"], "url": e["url"],
        "mp4_hi": (e.get("video") or {}).get("hi"), "mp4_lo": (e.get("video") or {}).get("lo"),
        "thumb": e.get("thumb"), "duration": e.get("durationS"),
    } for e in edits],
}
os.makedirs(os.path.join(root, "review"), exist_ok=True)
json.dump(out, open(os.path.join(root, "review", "catalog.json"), "w"), separators=(",", ":"))
print("wrote", len(out["edits"]), "edits")
