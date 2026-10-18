import { notFound } from "next/navigation";
import { getWingCounts, getWingPage } from "@/lib/data";
import { WINGS, wingBySlug } from "@/lib/wings";
import { EditGrid } from "@/components/EditCard";
import { PageHeader } from "@/components/PageHeader";
import { fmtCount } from "@/lib/format";

export function generateStaticParams() {
  return WINGS.map((w) => ({ wing: w.slug }));
}

const PAGE = 60;

export default async function WingPage({ params }: PageProps<"/hall/[wing]">) {
  const { wing } = await params;
  const w = wingBySlug(wing);
  if (!w) notFound();
  const [items, counts] = await Promise.all([getWingPage(w.slug, 0, PAGE), getWingCounts()]);
  return (
    <div>
      <PageHeader title={w.name} sub={`${fmtCount(counts[w.slug] ?? 0)} edits · ${w.tagline}`} display />
      <div className="p-4 sm:p-5">
        <EditGrid items={items} ranked />
        {(counts[w.slug] ?? 0) > PAGE && <p className="mt-6 text-center text-sm text-mute">Showing the top {PAGE}. The rest are in the feed.</p>}
      </div>
    </div>
  );
}
