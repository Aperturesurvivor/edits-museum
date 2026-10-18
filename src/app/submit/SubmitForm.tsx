"use client";
import { useState } from "react";

type W = { slug: string; name: string };
const MSG: Record<string, string> = {
  pending: "Submitted. It's in the review queue.",
  already_pending: "Already in the queue. Thanks.",
  exists: "Already in the museum.",
};

export function SubmitForm({ wings }: { wings: W[] }) {
  const [url, setUrl] = useState("");
  const [wing, setWing] = useState("");
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setState(null);
    try {
      const r = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, wing: wing || undefined }) });
      const j = await r.json();
      if (!r.ok) setState({ ok: false, text: j.error ?? "Something went wrong." });
      else { setState({ ok: true, text: MSG[j.status] ?? "Submitted." }); setUrl(""); }
    } catch {
      setState({ ok: false, text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4">
      <input value={url} onChange={(e) => setUrl(e.target.value)} required inputMode="url" placeholder="https://x.com/creator/status/…"
        className="w-full rounded-lg border border-line bg-black px-4 py-3 text-base outline-none placeholder:text-mute focus:border-gold" />
      <select value={wing} onChange={(e) => setWing(e.target.value)} className="w-full rounded-lg border border-line bg-black px-4 py-3 text-base outline-none focus:border-gold">
        <option value="">Genre (optional)</option>
        {wings.map((w) => <option key={w.slug} value={w.slug}>{w.name}</option>)}
      </select>
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className={`text-sm ${state ? (state.ok ? "text-gold" : "text-red-400") : ""}`}>{state?.text}</p>
        <button disabled={busy || !url} className="shrink-0 rounded-full bg-gold px-6 py-2.5 font-bold text-black disabled:opacity-40">{busy ? "Sending…" : "Submit"}</button>
      </div>
    </form>
  );
}
