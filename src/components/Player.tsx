"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PublicEdit } from "@/lib/types";
import { fmtCount } from "@/lib/format";
import { Video } from "./Video";

type Ctx = { open: (items: PublicEdit[], index: number) => void };
const PlayerCtx = createContext<Ctx>({ open: () => {} });
export const usePlayer = () => useContext(PlayerCtx);

/** On-site lightbox player with prev/next. Keyboard: ←/→ or j/k, m to mute, Esc to close. */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: PublicEdit[]; i: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const open = useCallback((items: PublicEdit[], i: number) => setState({ items, i }), []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback((d: number) => setState((s) => (s ? { ...s, i: (s.i + d + s.items.length) % s.items.length } : s)), []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "j") step(1);
      else if (e.key === "ArrowLeft" || e.key === "k") step(-1);
      else if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [state, close, step]);

  const e = state?.items[state.i];
  return (
    <PlayerCtx.Provider value={{ open }}>
      {children}
      {state && e && (
        <div role="dialog" aria-modal="true" aria-label={`Edit by @${e.author}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95" onClick={close}>
          <div className="relative flex h-full w-full max-w-[min(100vw,calc(100dvh*0.75))] flex-col py-4 sm:py-8" onClick={(ev) => ev.stopPropagation()}>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
              <Video key={e.id} edit={e} muted={muted} controls loop={false} onUnavailable={() => {}} />
            </div>
            <div className="flex items-center justify-between gap-3 px-1 pt-3 text-sm">
              <a href={`https://x.com/${e.author}`} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate font-bold hover:underline">@{e.author}</a>
              <div className="flex shrink-0 items-center gap-4 text-mute">
                <span className="tabular-nums">♥ {fmtCount(e.likes)}</span>
                <span className="tabular-nums">{state.i + 1} / {state.items.length}</span>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-link">View on X ↗</a>
              </div>
            </div>
          </div>
          <button aria-label="Close" onClick={close} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20">✕</button>
          {state.items.length > 1 && (
            <>
              <button aria-label="Previous" onClick={(ev) => { ev.stopPropagation(); step(-1); }} className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20 sm:flex">‹</button>
              <button aria-label="Next" onClick={(ev) => { ev.stopPropagation(); step(1); }} className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20 sm:flex">›</button>
            </>
          )}
        </div>
      )}
    </PlayerCtx.Provider>
  );
}
