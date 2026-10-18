import { ARMORY } from "@/lib/armory";
import { PageHeader } from "@/components/PageHeader";

export default function Armory() {
  return (
    <div>
      <PageHeader title="The Armory" sub="Free music, SFX, footage, overlays and type for building edits. A directory, not an editor. Check each license." />
      <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line px-4 py-3">
        {ARMORY.map((s) => (
          <a key={s.slug} href={`#${s.slug}`} className="shrink-0 rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:bg-white/10">{s.title}</a>
        ))}
      </nav>
      {ARMORY.map((s) => (
        <section key={s.slug} id={s.slug} className="scroll-mt-20 border-b border-line">
          <div className="px-4 pb-1 pt-5">
            <h2 className="text-lg font-extrabold">{s.title}</h2>
            <p className="text-sm text-mute">{s.blurb}</p>
          </div>
          <ul>
            {s.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/[0.03]">
                  <span className="min-w-0">
                    <span className="block font-bold">{l.name}</span>
                    <span className="block text-sm text-mute">{l.note}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-gold-dim px-2.5 py-0.5 text-xs font-semibold text-gold">{l.license}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
