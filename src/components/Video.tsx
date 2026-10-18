"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicEdit } from "@/lib/types";

/**
 * Streams the X CDN MP4 directly (video.twimg.com). We never download or re-host media.
 * X's CDN rejects foreign Referer headers, so the site sends no referrer (see next.config.ts + layout metadata).
 * Falls back hi -> lo -> "unavailable" (deleted/private post).
 */
export function Video({
  edit, active = true, muted = true, controls = false, loop = true, fit = "contain", onUnavailable, className = "",
}: {
  edit: PublicEdit; active?: boolean; muted?: boolean; controls?: boolean; loop?: boolean;
  fit?: "contain" | "cover"; onUnavailable?: () => void; className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const sources = [edit.video?.hi, edit.video?.lo].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(sources.length === 0);
  const src = sources[idx];

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, failed, src]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  if (failed) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-panel p-6 text-center ${className}`}>
        <p className="font-bold">This edit is unavailable</p>
        <p className="text-sm text-mute">The post may have been deleted or made private.</p>
        <a href={edit.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-link hover:underline">Try it on X ↗</a>
      </div>
    );
  }

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      poster={edit.thumb ?? undefined}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline
      preload={active ? "auto" : "metadata"}
      className={`h-full w-full bg-black ${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
      onError={() => {
        if (idx + 1 < sources.length) setIdx(idx + 1);
        else { setFailed(true); onUnavailable?.(); }
      }}
    />
  );
}
