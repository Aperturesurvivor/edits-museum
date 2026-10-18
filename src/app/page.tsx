import Link from "next/link";
import { getHallOfFame, getWingCounts, getWingEdits } from "@/lib/data";
import { LEAD_WING, WINGS, wingBySlug } from "@/lib/wings";
import { EditGrid } from "@/components/EditCard";
import { Carousel } from "@/components/Carousel";
import { fmtCount } from "@/lib/format";

export default async function GrandHall() {
  const [top, counts, lead] = await Promise.all([getHallOfFame(12), getWingCounts(), getWingEdits(LEAD_WING, 6, 2)]);
  const leadWing = wingBySlug(LEAD_WING)!;
  const wings = await Promise.all(
    WINGS.filter((w) => w.slug !== "unsorted" && w.slug !== LEAD_WING && counts[w.slug]).map(async (w) => ({ w, items: await getWingEdits(w.slug, 12) })),
  );
  return (
    <div>
      <section className="border-b border-line px-4 pb-6 pt-8 sm:px-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.3em] text-accent">
          <span aria-hidden>★</span> The Grand Hall
        </p>
        <h1 className="display mt-2 text-6xl sm:text-7xl">The greatest<br />edits on Earth.</h1>
        <div className="stripe mt-4 w-28 rounded-full" aria-hidden />
        <p className="mt-4 max-w-md text-[15px] text-bone/80">Founders, frontier, flight, the fastest cars and the biggest wins. American excellence, cut to music. Tap any edit to play it here.</p>
        <div className="mt-5 flex gap-3">
          <Link href="/feed" className="rounded-full bg-accent px-5 py-2 font-extrabold text-white hover:bg-accent-deep">Open the feed</Link>
          <Link href="/onboarding" className="rounded-full border border-line px-5 py-2 font-bold hover:bg-white/10">Pick your genres</Link>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent">★ Lead wing</p>
            <h2 className="display text-4xl">{leadWing.name}</h2>
            <p className="truncate text-sm text-mute">{leadWing.tagline}</p>
          </div>
          <Link href={`/hall/${LEAD_WING}`} className="shrink-0 text-sm font-bold text-link hover:underline">Enter wing →</Link>
        </div>
        <EditGrid items={lead} />
      </section>

      <section className="border-t border-line px-4 py-5 sm:px-5">
        <h2 className="display mb-3 text-3xl">Hall of Fame</h2>
        <EditGrid items={top} ranked />
      </section>

      {wings.map(({ w, items }) => (
        <section key={w.slug} className="border-t border-line py-5">
          <div className="mb-3 flex items-end justify-between gap-3 px-4 sm:px-5">
            <div className="min-w-0">
              <h2 className="display text-2xl">{w.name}</h2>
              <p className="truncate text-sm text-mute">{w.tagline} · {fmtCount(counts[w.slug])} edits</p>
            </div>
            <Link href={`/hall/${w.slug}`} className="shrink-0 text-sm font-bold text-link hover:underline">Enter wing →</Link>
          </div>
          <Carousel items={items} />
        </section>
      ))}
    </div>
  );
}
