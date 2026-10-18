import { EDITS, WINGS, toPublic } from "@/lib/data";
import { Feed } from "./Feed";

export default function FeedPage() {
  const items = EDITS.map(toPublic);
  const wingNames = Object.fromEntries(WINGS.map((w) => [w.slug, w.name]));
  return <Feed items={items} wingNames={wingNames} />;
}
