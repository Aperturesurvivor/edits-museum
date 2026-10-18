import { WINGS } from "@/lib/data";
import { GenrePicker } from "./GenrePicker";
import { PageHeader } from "@/components/PageHeader";

export default function Onboarding() {
  const wings = WINGS.filter((w) => w.slug !== "unsorted").map(({ slug, name, tagline }) => ({ slug, name, tagline }));
  return (
    <div>
      <PageHeader title="What do you want to see?" sub="Pick the genres that hit hardest. Your feed is built from these." />
      <GenrePicker wings={wings} />
    </div>
  );
}
