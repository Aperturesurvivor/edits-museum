import { notFound } from "next/navigation";
import { WINGS, editsInWing, toPublic, wingBySlug } from "@/lib/data";
import { EditCard } from "@/components/EditCard";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return WINGS.map((w) => ({ wing: w.slug }));
}

export default async function WingPage({ params }: PageProps<"/hall/[wing]">) {
  const { wing } = await params;
  const w = wingBySlug(wing);
  if (!w) notFound();
  const items = editsInWing(w.slug).map(toPublic);
  return (
    <div>
      <PageHeader title={w.name} sub={`${items.length} edits · ${w.tagline}`} display />
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((e, i) => <EditCard key={e.id} edit={e} rank={i < 3 ? i + 1 : undefined} />)}
      </div>
    </div>
  );
}
