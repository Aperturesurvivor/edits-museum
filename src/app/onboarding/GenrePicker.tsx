"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setGenres, useGenres } from "@/lib/prefs";

type W = { slug: string; name: string; tagline: string };

export function GenrePicker({ wings }: { wings: W[] }) {
  const saved = useGenres();
  const [picked, setPicked] = useState<string[] | null>(null);
  const router = useRouter();
  const current = picked ?? saved ?? [];
  const toggle = (s: string) => setPicked(current.includes(s) ? current.filter((x) => x !== s) : [...current, s]);
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {wings.map((w) => {
          const on = current.includes(w.slug);
          return (
            <button key={w.slug} onClick={() => toggle(w.slug)} aria-pressed={on}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${on ? "border-gold bg-gold/10" : "border-line hover:bg-white/5"}`}>
              <span>
                <span className="block font-bold">{w.name}</span>
                <span className="block text-sm text-mute">{w.tagline}</span>
              </span>
              <span className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${on ? "border-gold bg-gold text-black" : "border-line"}`}>{on ? "✓" : ""}</span>
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
