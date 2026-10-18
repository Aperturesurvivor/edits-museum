# %% [markdown]
# # Edits Museum: visual review
# **How to run:** `Runtime → Change runtime type → A100 GPU` (L4 or T4 also work, with smaller models), then `Runtime → Run all`.
# Allow Google Drive when asked (progress is saved there, so a disconnect just resumes). When it finishes,
# `verdicts.json` downloads automatically. Drag that file into chat.
#
# What it does for every edit: streams the MP4 from X's CDN (no referrer, temp files only), samples 8 frames
# across the video plus audio, then runs open models:
# - **SigLIP 2** frame embeddings vs wing descriptions → 0-1 weights per wing
# - **Qwen2.5-VL** (7B on A100/L4, 3B on T4) → is_edit / fit / nsfw / suggestive / illegal / slur checks with confidence
# - **faster-whisper large-v3** → transcript (fed to the VLM for explicit/slur checks)
#
# Nothing to edit. Settings below are optional.

# %%
# Optional settings
import os
LIMIT = int(os.environ.get("EM_LIMIT", "0"))  # 0 = review everything. Set e.g. 20 for a quick trial.
REPO_RAW = "https://raw.githubusercontent.com/Aperturesurvivor/edits-museum/main"
DRIVE_DIR = "/content/drive/MyDrive/edits-museum-review"
FORCE_TINY = False     # True = tiny models (testing only)

# %%
import os, sys, subprocess, importlib.util
IN_COLAB = "google.colab" in sys.modules or os.path.exists("/content")
def _pip(*pk):
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", *pk], check=False)
if IN_COLAB:
    _pip("open_clip_torch>=3.0", "faster-whisper>=1.1", "transformers>=4.57", "accelerate", "qwen-vl-utils")
    subprocess.run(["bash", "-lc", "command -v ffmpeg || (apt-get -qq update && apt-get -qq install -y ffmpeg)"], check=False)
import torch
GPU = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"
VRAM = torch.cuda.get_device_properties(0).total_memory / 2**30 if torch.cuda.is_available() else 0
TINY = FORCE_TINY or VRAM == 0
if TINY:
    CFG = dict(siglip="ViT-B-16-SigLIP2-256", vlm="Qwen/Qwen2.5-VL-3B-Instruct", whisper="tiny", wcompute="int8", wdevice="cpu",
               dtype=torch.bfloat16, batch=1, max_pixels=160 * 28 * 28, prep_workers=4)
elif VRAM >= 35:   # A100 40/80GB, H100
    CFG = dict(siglip="ViT-SO400M-14-SigLIP2-378", vlm="Qwen/Qwen2.5-VL-7B-Instruct", whisper="large-v3", wcompute="float16", wdevice="cuda",
               dtype=torch.bfloat16, batch=8, max_pixels=448 * 448, prep_workers=12)
elif VRAM >= 20:   # L4 24GB, A10G
    CFG = dict(siglip="ViT-L-16-SigLIP2-384", vlm="Qwen/Qwen2.5-VL-7B-Instruct", whisper="large-v3", wcompute="int8_float16", wdevice="cuda",
               dtype=torch.bfloat16, batch=3, max_pixels=392 * 392, prep_workers=8)
else:              # T4 16GB (no bf16)
    CFG = dict(siglip="ViT-L-16-SigLIP2-256", vlm="Qwen/Qwen2.5-VL-3B-Instruct", whisper="large-v3", wcompute="int8_float16", wdevice="cuda",
               dtype=torch.float16, batch=2, max_pixels=336 * 336, prep_workers=6)
print(f"GPU: {GPU} ({VRAM:.0f} GB) -> {CFG['vlm']}, {CFG['siglip']}, whisper {CFG['whisper']}")
if VRAM == 0 and IN_COLAB and not FORCE_TINY:
    print("⚠️  No GPU. Use Runtime → Change runtime type → A100 (or L4/T4), then Run all again.")

# %%
# Progress lives on Google Drive so a disconnect resumes where it left off.
OUT = DRIVE_DIR
if IN_COLAB and os.path.exists("/content"):
    try:
        from google.colab import drive
        drive.mount("/content/drive")
    except Exception as ex:
        print("Drive not mounted, saving locally instead (won't survive a disconnect):", ex)
        OUT = "/content/edits-museum-review"
else:
    OUT = os.environ.get("EM_REVIEW_OUT", "/tmp/em-review")
os.makedirs(OUT, exist_ok=True)
PROGRESS = os.path.join(OUT, "progress.jsonl")
print("Saving progress to", PROGRESS)

# %%
import json, urllib.request
def http_get(url, path=None, timeout=60):
    # No Referer header: X's CDN rejects foreign referrers.
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 EditsMuseumReview/2.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        if path is None:
            return r.read()
        with open(path, "wb") as f:
            while True:
                b = r.read(1 << 16)
                if not b:
                    break
                f.write(b)
CATALOG_URL = REPO_RAW + "/review/catalog.json"
src = os.environ.get("EM_CATALOG")
catalog = json.load(open(src)) if src else json.loads(http_get(CATALOG_URL))
WINGS = catalog["wings"]
edits = catalog["edits"]
done = set()
if os.path.exists(PROGRESS):
    for line in open(PROGRESS):
        try:
            done.add(json.loads(line)["id"])
        except Exception:
            pass
todo = [e for e in edits if e["id"] not in done]
if LIMIT:
    todo = todo[:LIMIT]
print(f"{len(edits)} edits in catalog, {len(done)} already reviewed, {len(todo)} to go")

# %%
# Media prep: download MP4 to a temp file, 8 frames across the duration, scene cuts, 16 kHz audio. Temp files are deleted.
import tempfile, numpy as np
from PIL import Image
TMP = tempfile.mkdtemp(prefix="em-")
POS = [0.05, 0.18, 0.31, 0.44, 0.57, 0.70, 0.83, 0.95]
def _run(cmd, timeout=180):
    return subprocess.run(cmd, capture_output=True, timeout=timeout)
def prep(e):
    out = {"id": e["id"]}
    vid = os.path.join(TMP, e["id"] + ".mp4")
    err = "no video"
    for u in [x for x in (e.get("mp4_hi"), e.get("mp4_lo")) if x]:
        try:
            http_get(u, vid, 90)
            if os.path.getsize(vid) > 1000:
                err = None
                break
        except Exception as ex:
            err = str(ex)[:120]
    if err:
        out["dead"] = err
        return out
    try:
        p = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vid])
        dur = float((p.stdout or b"0").strip() or 0) or float(e.get("duration") or 0)
        out["duration"] = dur
        frames = []
        for i, t in enumerate(POS):
            fp = os.path.join(TMP, f"{e['id']}_{i}.jpg")
            _run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur * t:.2f}", "-i", vid, "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", fp])
            if os.path.exists(fp):
                frames.append(Image.open(fp).convert("RGB")); os.remove(fp)
        out["frames"] = frames
        sc = _run(["ffmpeg", "-v", "info", "-i", vid, "-vf", "scale=160:-2,select='gt(scene,0.30)',showinfo", "-an", "-f", "null", "-"])
        out["cuts"] = sc.stderr.decode("utf-8", "ignore").count("pts_time:")
        au = _run(["ffmpeg", "-v", "error", "-i", vid, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
        out["audio"] = np.frombuffer(au.stdout, np.int16).astype(np.float32) / 32768.0
    except Exception as ex:
        out["error"] = str(ex)[:200]
    finally:
        try: os.remove(vid)
        except OSError: pass
    return out

# %%
# Models
import open_clip
DEV = "cuda" if VRAM else "cpu"
sig_model, _, sig_pre = open_clip.create_model_and_transforms(CFG["siglip"], pretrained="webli", device=DEV)
sig_model.eval()
sig_tok = open_clip.get_tokenizer(CFG["siglip"])
_wl, _wt = [], []
for w in WINGS:
    for p in w["prototypes"]:
        _wl.append(w["slug"]); _wt.append(p)
with torch.no_grad():
    _t = sig_model.encode_text(sig_tok(_wt).to(DEV)).float()
    SIG_TEXT = _t / _t.norm(dim=-1, keepdim=True)
SIG_SCALE = float(sig_model.logit_scale.exp().item())
SIG_BIAS = float(sig_model.logit_bias.item()) if getattr(sig_model, "logit_bias", None) is not None else 0.0

def siglip_scores(frames):
    """Per wing: mean of the top-3 frame logits (best prototype per frame) -> sigmoid -> 0-1."""
    with torch.no_grad():
        x = torch.stack([sig_pre(f) for f in frames]).to(DEV)
        v = sig_model.encode_image(x).float()
        v = v / v.norm(dim=-1, keepdim=True)
        L = (v @ SIG_TEXT.T * SIG_SCALE + SIG_BIAS).cpu().numpy()
    raw, w = {}, {}
    for slug in dict.fromkeys(_wl):
        idx = [i for i, s in enumerate(_wl) if s == slug]
        pf = np.sort(L[:, idx].max(axis=1))[::-1][:3]
        z = float(pf.mean())
        raw[slug] = round(z, 3)
        w[slug] = round(float(1 / (1 + np.exp(-(z + 4.0) / 2.0))), 3)  # SigLIP logits sit low; shift so a clear match ≈ 0.8+
    return raw, w

from faster_whisper import WhisperModel
try:
    whisper = WhisperModel(CFG["whisper"], device=CFG["wdevice"], compute_type=CFG["wcompute"])
except Exception as ex:
    print("Whisper on GPU failed, using CPU small:", ex)
    whisper = WhisperModel("small", device="cpu", compute_type="int8")
def _transcribe(audio):
    segs, info = whisper.transcribe(audio, beam_size=1 if TINY else 5, vad_filter=True, condition_on_previous_text=False)
    segs = list(segs)
    return {"text": " ".join(s.text.strip() for s in segs)[:1500], "lang": info.language,
            "speech_s": round(float(sum(s.end - s.start for s in segs)), 1)}

def transcribe(audio):
    global whisper
    if audio is None or audio.size < 16000:
        return {"text": "", "lang": None, "speech_s": 0.0}
    try:
        return _transcribe(audio)
    except Exception as ex:
        if CFG["wdevice"] == "cuda":  # e.g. a cuDNN mismatch in ctranslate2: fall back to CPU once
            print("Whisper GPU error, switching to CPU small:", ex)
            CFG["wdevice"], CFG["whisper"] = "cpu", "small"
            whisper = WhisperModel("small", device="cpu", compute_type="int8")
            return _transcribe(audio)
        return {"text": "", "lang": None, "speech_s": 0.0, "error": str(ex)[:200]}

from transformers import AutoProcessor, AutoModelForImageTextToText
vlm_proc = AutoProcessor.from_pretrained(CFG["vlm"], size={"shortest_edge": 64 * 28 * 28, "longest_edge": CFG["max_pixels"]})
vlm_proc.tokenizer.padding_side = "left"
vlm = AutoModelForImageTextToText.from_pretrained(CFG["vlm"], dtype=CFG["dtype"], device_map="auto" if VRAM else None)
vlm.eval()
print("models loaded")

# %%
WING_SLUGS_STR = ", ".join(w["slug"] for w in WINGS)
WING_LINES = "\n".join(f'- "{w["slug"]}": {w["describe"]}' for w in WINGS)
RULES = f"""You are reviewing a short video for "Edits Museum", a pro-America gallery of fan-made video edits.
You see {len(POS)} frames sampled in order across the video, plus its audio transcript and cut count.

Decide:
- is_edit: a fan-made edit (cut to music, montage, effects, color grading, text animation, speech set to visuals). NOT an edit: a raw unedited clip, a single static shot of someone talking, a plain screenshot, a news segment with no editing.
- fit: the edit celebrates Western civilization or American excellence. Americana first; also Rome/Greece, Christendom, Western history, medieval/Norse, frontier/cowboys, space, military, US sports (NFL, NBA, MLB, UFC/boxing), engineering/industry, cars/F1, architecture, the nature of the West. NOT fit: reality TV, K-pop or celebrity fancams, generic AI slop, memes with no civilizational theme, random vlogs, anime/film/gaming with no such theme.
- nsfw: nudity or sexual content. suggestive: sexualized poses, lingerie/underwear focus, twerking, sexualized massage, etc.
- illegal: graphic real violence/gore, child safety issues, terrorism promotion, or other clearly illegal content.
- slur_or_hate: racial/ethnic/religious slurs (in text on screen or in the transcript) or hate symbols.
- wings: 0-1 relevance for EACH wing by what is ON SCREEN:
{WING_LINES}
- confidence: 0-1, how sure you are of the whole verdict.

Answer with ONLY one JSON object with exactly these keys (fill in your own values, judged from THIS video):
is_edit, fit, nsfw, suggestive, illegal, slur_or_hate: true or false
wings: an object with EVERY one of these keys, each a number from 0 to 1: {WING_SLUGS_STR}
primary_wing: the key with the highest number
confidence: a number from 0 to 1
why: one short sentence describing what is actually on screen"""

def vlm_batch(items):
    texts, images = [], []
    for it in items:
        fr = it["frames"]
        pick = fr if len(fr) <= 6 else [fr[i] for i in np.linspace(0, len(fr) - 1, 6).round().astype(int)]
        tr = (it["asr"]["text"] or "(no speech)")[:600]
        content = [{"type": "image"} for _ in pick] + [{"type": "text", "text": f"{RULES}\n\nDuration: {it['duration']:.0f}s. Scene cuts: {it['cuts']}. Transcript: {tr}"}]
        texts.append(vlm_proc.apply_chat_template([{"role": "user", "content": content}], tokenize=False, add_generation_prompt=True))
        images.append(pick)
    inputs = vlm_proc(text=texts, images=images, return_tensors="pt", padding=True).to(vlm.device)
    with torch.no_grad():
        out = vlm.generate(**inputs, max_new_tokens=320, do_sample=False)
    gen = out[:, inputs["input_ids"].shape[1]:]
    return [vlm_proc.decode(g, skip_special_tokens=True) for g in gen]

def parse_json(s):
    s = s.strip().strip("`")
    i, j = s.find("{"), s.rfind("}")
    try:
        return json.loads(s[i : j + 1])
    except Exception:
        return None

def decide(v, sig_w, cuts=None):
    """Provisional verdict. The site's ingest script re-applies (tunable) rules."""
    if v is None:
        return "queue", "vlm output unparsable"
    if v.get("illegal"): return "reject_illegal", v.get("why", "")
    if v.get("nsfw") or v.get("suggestive"): return "reject_nsfw", v.get("why", "")
    if not v.get("is_edit", True): return "reject_not_edit", v.get("why", "")
    if v.get("slur_or_hate"): return "queue", "possible slur/hate symbol: " + v.get("why", "")
    if not v.get("fit"): return "reject_unfit", v.get("why", "")
    if cuts == 0: return "queue", "no scene cuts detected, may be a raw clip: " + v.get("why", "")
    if float(v.get("confidence", 0) or 0) < 0.6: return "queue", "low confidence: " + v.get("why", "")
    ws = v.get("wings") or {}
    if not isinstance(ws, dict) or len(ws) < 3: return "queue", "incomplete wing scores: " + v.get("why", "")
    return "pass", v.get("why", "")

# %%
# Main loop: prep in a thread pool, models on the GPU in batches, append each result to Drive immediately.
import time
from concurrent.futures import ThreadPoolExecutor
def run_all():
    n0, t0, buf = len(done), time.time(), []
    fo = open(PROGRESS, "a")
    def flush(items):
        if not items:
            return
        try:
            outs = vlm_batch(items)
        except Exception as ex:
            if len(items) > 1:  # e.g. OOM on a big batch: retry one by one
                torch.cuda.empty_cache() if VRAM else None
                outs = []
                for it in items:
                    try: outs += vlm_batch([it])
                    except Exception as ex2: outs.append("ERROR " + str(ex2)[:100])
            else:
                outs = ["ERROR " + str(ex)[:100]]
        for it, o in zip(items, outs):
            v = parse_json(o)
            verdict, why = decide(v, it["sig_w"], it.get("cuts"))
            rec = {"id": it["id"], "verdict": verdict, "why": why, "vlm": v, "vlm_raw": None if v else o[:300],
                   "siglip_raw": it["sig_raw"], "siglip_w": it["sig_w"], "cuts": it["cuts"], "duration": round(it["duration"], 1),
                   "asr": it["asr"], "models": {"vlm": CFG["vlm"], "siglip": CFG["siglip"], "whisper": CFG["whisper"]},
                   "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
            fo.write(json.dumps(rec) + "\n")
        fo.flush()
    with ThreadPoolExecutor(CFG["prep_workers"]) as ex:
        for k, p in enumerate(ex.map(prep, todo), 1):
            if "dead" in p or "error" in p or not p.get("frames"):
                fo.write(json.dumps({"id": p["id"], "verdict": "dead", "why": p.get("dead") or p.get("error") or "no frames",
                                     "at": time.strftime("%Y-%m-%dT%H:%M:%S")}) + "\n"); fo.flush()
            else:
                p["sig_raw"], p["sig_w"] = siglip_scores(p["frames"])
                p["asr"] = transcribe(p.pop("audio", None))
                buf.append(p)
                if len(buf) >= CFG["batch"]:
                    flush(buf); buf = []
            if k % 25 == 0 or k == len(todo):
                el = time.time() - t0
                print(f"{n0 + k}/{n0 + len(todo)}  {k / el * 60:.1f}/min  ~{(len(todo) - k) / max(k / el, 1e-6) / 60:.0f} min left", flush=True)
        flush(buf)
    fo.close()
run_all()

# %%
# Collect every result into verdicts.json (on Drive) and download it.
from collections import Counter
results = {}
for line in open(PROGRESS):
    try:
        r = json.loads(line); results[r["id"]] = r
    except Exception:
        pass
VERDICTS = os.path.join(OUT, "verdicts.json")
json.dump({"generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "gpu": GPU, "models": CFG and {k: CFG[k] for k in ("vlm", "siglip", "whisper")},
           "count": len(results), "results": list(results.values())}, open(VERDICTS, "w"))
print(Counter(r["verdict"] for r in results.values()))
print("Saved", VERDICTS)
if IN_COLAB and os.path.exists("/content"):
    try:
        from google.colab import files
        files.download(VERDICTS)
    except Exception as ex:
        print("Download it from Google Drive → My Drive → edits-museum-review → verdicts.json", ex)
