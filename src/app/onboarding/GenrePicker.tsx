"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setGenres, useGenres } from "@/lib/prefs";

type W = { slug: string; name: string; tagline: string };

export function GenrePicker({ wings, lead }: { wings: W[]; lead: string }) {
  const saved = useGenres();
  const [picked, setPicked] = useState<string[] | null>(null);
  const router = useRouter();
  const current = picked ?? (saved?.length ? saved : [lead]);
  const leadWing = wings.find((w) => w.slug === lead);
  const rest = wings.filter((w) => w.slug !== lead);
  const toggle = (s: string) => setPicked(current.includes(s) ? current.filter((x) => x !== s) : [...current, s]);
  return (
    <div className="p-4 sm:p-5">
      {leadWing && (
        <button onClick={() => toggle(leadWing.slug)} aria-pressed={current.includes(leadWing.slug)}
          className={`mb-3 flex w-full items-center justify-between rounded-2xl border px-5 py-5 text-left transition ${current.includes(leadWing.slug) ? "border-accent bg-accent/10" : "border-line hover:bg-white/5"}`}>
          <span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent">★ Featured</span>
            <span className="display mt-1 block text-4xl">{leadWing.name}</span>
            <span className="block text-sm text-mute">{leadWing.tagline}</span>
          </span>
          <span className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${current.includes(leadWing.slug) ? "border-accent bg-accent text-white" : "border-line"}`}>{current.includes(leadWing.slug) ? "✓" : ""}</span>
        </button>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rest.map((w) => {
          const on = current.includes(w.slug);
          return (
            <button key={w.slug} onClick={() => toggle(w.slug)} aria-pressed={on}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${on ? "border-accent bg-accent/10" : "border-line hover:bg-white/5"}`}>
              <span>
                <span className="block font-bold">{w.name}</span>
                <span className="block text-sm text-mute">{w.tagline}</span>
              </span>
              <span className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${on ? "border-accent bg-accent text-white" : "border-line"}`}>{on ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="sticky bottom-16 mt-6 flex items-center justify-between rounded-full border border-line bg-black/90 p-2 pl-5 backdrop-blur sm:bottom-4">
        <span className="text-sm text-mute">{current.length ? `${current.length} picked` : "Pick at least one"}</span>
        <button disabled={!current.length} onClick={() => { setGenres(current); router.push("/feed"); }}
          className="rounded-full bg-bone px-6 py-2 font-bold text-black disabled:opacity-40">Build my feed</button>
      </div>
    </div>
  );
}
