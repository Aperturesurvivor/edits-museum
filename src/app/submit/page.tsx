import { WINGS } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { SubmitForm } from "./SubmitForm";

export default function Submit() {
  const wings = WINGS.filter((w) => w.slug !== "unsorted").map(({ slug, name }) => ({ slug, name }));
  return (
    <div>
      <PageHeader title="Submit an edit" sub="Paste a link to an edit on X. It goes into the review queue before it hits the Hall." />
      <SubmitForm wings={wings} />
      <div className="mx-4 rounded-xl border border-line p-4 text-sm text-mute">
        <p className="font-bold text-bone">What counts</p>
        <p className="mt-1">Edits only: cut-to-music video with real editing. No plain clips, selfies or text posts. Illegal and NSFW content is removed.</p>
      </div>
    </div>
  );
}
