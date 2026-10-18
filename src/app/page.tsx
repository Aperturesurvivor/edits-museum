import Link from "next/link";
import { WINGS, editsInWing, hallOfFame, toPublic } from "@/lib/data";
import { EditCard } from "@/components/EditCard";

export default function GrandHall() {
  const top = hallOfFame().map(toPublic);
  const wings = WINGS.map((w) => ({ w, items: editsInWing(w.slug).slice(0, 8).map(toPublic) })).filter((x) => x.items.length);
  return (
    <div>
      <section className="border-b border-line px-4 pb-8 pt-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Edits Museum</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-none tracking-wide sm:text-6xl">The Grand Hall</h1>
        <p className="mt-3 max-w-xl text-mute">The hardest edits on the internet, ranked. Tap any piece to play it on X.</p>
        <div className="mt-5 flex gap-3">
          <Link href="/feed" className="rounded-full bg-bone px-5 py-2 font-bold text-black hover:bg-white">Open the feed</Link>
          <Link href="/onboarding" className="rounded-full border border-line px-5 py-2 font-bold hover:bg-white/10">Pick your genres</Link>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold tracking-wide text-gold">Hall of Fame</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {top.map((e, i) => <EditCard key={e.id} edit={e} rank={i + 1} />)}
        </div>
      </section>

      {wings.map(({ w, items }) => (
        <section key={w.slug} className="border-t border-line py-6">
          <div className="mb-3 flex items-end justify-between px-4 sm:px-8">
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-wide">{w.name}</h2>
              <p className="text-sm text-mute">{w.tagline}</p>
            </div>
            <Link href={`/hall/${w.slug}`} className="text-sm font-bold text-gold hover:underline">Enter wing →</Link>
          </div>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 sm:px-8">
            {items.map((e) => <div key={e.id} className="w-44 shrink-0 snap-start sm:w-52"><EditCard edit={e} /></div>)}
          </div>
        </section>
      ))}
    </div>
  );
}
