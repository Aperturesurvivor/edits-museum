import Link from "next/link";
import { getLiveCount, getWingCounts } from "@/lib/data";
import { WINGS } from "@/lib/wings";
import { fmtCount } from "@/lib/format";

export async function RightRail() {
  const counts = await getWingCounts();
  const total = await getLiveCount();
  const wings = WINGS.filter((w) => w.slug !== "unsorted" && counts[w.slug]);
  return (
    <aside className="sticky top-0 hidden h-dvh w-[320px] shrink-0 flex-col gap-4 overflow-y-auto px-5 py-4 lg:flex">
      <section className="rounded-2xl border border-line">
        <h2 className="px-4 pb-1 pt-3 text-lg font-extrabold">Wings</h2>
        <ul className="pb-2">
          {wings.map((w) => (
            <li key={w.slug}>
              <Link href={`/hall/${w.slug}`} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.04]">
                <span className="text-[15px] font-bold">{w.name}</span>
                <span className="text-xs tabular-nums text-mute">{fmtCount(counts[w.slug])}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-line p-4">
        <h2 className="text-lg font-extrabold">Got a hard edit?</h2>
        <p className="mt-1 text-sm text-mute">Paste an X link. It goes into the review queue.</p>
        <Link href="/submit" className="mt-3 block rounded-full bg-accent py-2 text-center font-bold text-black hover:bg-accent-deep">Submit an edit</Link>
      </section>
      <p className="px-1 text-xs text-mute">
        {fmtCount(total)} edits · <Link href="/about" className="hover:underline">About & rules</Link> · <Link href="/armory" className="hover:underline">Armory</Link> · Open source (MIT)
      </p>
    </aside>
  );
}
