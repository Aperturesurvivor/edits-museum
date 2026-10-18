"use client";
import { useRef } from "react";
import type { PublicEdit } from "@/lib/types";
import { EditCard } from "./EditCard";

/** Contained horizontal row with snap + arrows. Never causes page-level overflow. */
export function Carousel({ items }: { items: PublicEdit[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.9, behavior: "smooth" });
  return (
    <div className="group/row relative">
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-5 sm:px-5">
        {items.map((e, i) => (
          <div key={e.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
            <EditCard edit={e} list={items} index={i} />
          </div>
        ))}
      </div>
      {[-1, 1].map((d) => (
        <button key={d} aria-label={d < 0 ? "Scroll left" : "Scroll right"} onClick={() => scroll(d)}
          className={`absolute top-[calc(50%-20px)] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/80 text-xl ring-1 ring-line transition hover:bg-white hover:text-black group-hover/row:flex ${d < 0 ? "left-1" : "right-1"}`}>
          {d < 0 ? "‹" : "›"}
        </button>
      ))}
    </div>
  );
}
