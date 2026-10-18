#!/usr/bin/env python3
"""
Apply the Colab review's verdicts.json to the site data.

  python3 scripts/ingest-verdicts.py ~/Downloads/verdicts.json

Writes:
  data/review.json           id -> {verdict, wing, weights, confidence, reason, ...}  (only "pass" goes live)
  data/private/queue.json    low-confidence / possible-slur items for a human look (gitignored)
Prints counts by verdict, rejects by reason and live edits by wing.

Weights: 0-1 per wing = 0.6 * VLM score + 0.4 * SigLIP score (SigLIP alone if the VLM gave none).
Primary wing = max weight. An edit is listed in every wing with weight >= MEMBER (plus its primary).
Ranking multiplies each wing's boost by its weight (src/lib/ranking.ts), so Americana 0.92 gets most of the Americana boost.
"""
import json, os, sys
from collections import Counter

MEMBER = 0.5
MIN_CONF = 0.6
WINGS = ["americana", "rome", "christendom", "medieval", "history", "frontier", "military", "arena", "motorsport", "builders"]

root = os.path.join(os.path.dirname(__file__), "..")
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "verdicts.json")
data = json.load(open(src))
results = data["results"] if isinstance(data, dict) else data
catalog_ids = {e["id"] for e in json.load(open(os.path.join(root, "data", "edits.json")))}

def clamp(x):
    try:
        return max(0.0, min(1.0, float(x)))
    except Exception:
        return 0.0

def decide(r):
    v = r.get("vlm")
    if r.get("verdict") == "dead":
        return "dead", r.get("why", "")
    if not v:
        return "queue", "no VLM verdict"
    why = v.get("why", "")
    if v.get("illegal"): return "reject_illegal", why
    if v.get("nsfw") or v.get("suggestive"): return "reject_nsfw", why
    if v.get("is_edit") is False: return "reject_not_edit", why
    if v.get("slur_or_hate"): return "queue", "possible slur/hate: " + why
    if not v.get("fit"): return "reject_unfit", why
    if r.get("cuts") == 0: return "queue", "no scene cuts detected, may be a raw clip: " + why
    if clamp(v.get("confidence")) < MIN_CONF: return "queue", "low confidence: " + why
    return "pass", why

review, queue, verdicts, live_wings = {}, [], Counter(), Counter()
for r in results:
    if r["id"] not in catalog_ids:
        continue
    verdict, why = decide(r)
    v = r.get("vlm") or {}
    vw = {k: clamp(x) for k, x in (v.get("wings") or {}).items() if k in WINGS}
    sw = {k: clamp(x) for k, x in (r.get("siglip_w") or {}).items() if k in WINGS}
    weights = {}
    for k in WINGS:
        if k in vw or k in sw:
            weights[k] = round(0.6 * vw.get(k, 0) + 0.4 * sw.get(k, 0) if vw else sw.get(k, 0), 3)
    primary = max(weights, key=weights.get) if weights else None
    if v.get("primary_wing") in WINGS and weights.get(v["primary_wing"], 0) >= weights.get(primary or "", 0) - 0.05:
        primary = v["primary_wing"]
    review[r["id"]] = {
        "verdict": verdict, "wing": primary, "weights": weights,
        "confidence": round(clamp(v.get("confidence")), 2) if v else None,
        "reason": why[:200], "reviewedAt": r.get("at"), "models": r.get("models"),
    }
    verdicts[verdict] += 1
    if verdict == "pass":
        for k in {primary, *[k for k, w in weights.items() if w >= MEMBER]}:
            if k:
                live_wings[k] += 1
    if verdict == "queue":
        queue.append({"id": r["id"], "url": f"https://x.com/i/status/{r['id']}", "why": why, "weights": weights})

json.dump(review, open(os.path.join(root, "data", "review.json"), "w"), separators=(",", ":"))
os.makedirs(os.path.join(root, "data", "private"), exist_ok=True)
json.dump(queue, open(os.path.join(root, "data", "private", "queue.json"), "w"), indent=1)
print("reviewed:", len(review), "of", len(catalog_ids))
print("verdicts:", dict(verdicts.most_common()))
print("live by wing (an edit can be in several):", dict(live_wings.most_common()))
print("queue ->", os.path.join("data", "private", "queue.json"), len(queue))
