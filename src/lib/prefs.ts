"use client";
import { useSyncExternalStore } from "react";

const KEY = "em:genres";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cache: { raw: string | null; val: string[] } = { raw: null, val: EMPTY };

function read(): string[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    try { cache = { raw, val: raw ? JSON.parse(raw) : EMPTY }; } catch { cache = { raw, val: EMPTY }; }
  }
  return cache.val;
}

export function setGenres(g: string[]) {
  localStorage.setItem(KEY, JSON.stringify(g));
  listeners.forEach((l) => l());
}

/** v1: genre picks live in localStorage. Accounts come later. Returns null until hydrated. */
export function useGenres(): string[] | null {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => null,
  );
}
