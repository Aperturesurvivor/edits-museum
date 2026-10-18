import { PageHeader } from "@/components/PageHeader";

export default function About() {
  return (
    <div>
      <PageHeader title="About & rules" />
      <div className="max-w-2xl space-y-5 px-4 py-6 text-[15px] leading-relaxed">
        <p>Edits Museum is home to the greatest edits on Earth, with American excellence front and center. It&apos;s a public square for edits. Every piece links back to its creator and plays on the platform where it was posted. We never re-host video.</p>
        <div>
          <h2 className="font-extrabold">What gets removed</h2>
          <ul className="mt-1 list-disc pl-5 text-mute">
            <li>Illegal content</li>
            <li>Things that aren&apos;t edits (plain clips, selfies, text posts)</li>
            <li>NSFW / sexual content</li>
          </ul>
        </div>
        <div>
          <h2 className="font-extrabold">How ranking works</h2>
          <p className="text-mute">Freedom of speech, not freedom of reach. Ranking blends engagement with a lean toward edits that celebrate civilization: building, beauty, faith, heroism, achievement.</p>
        </div>
        <p className="text-sm text-mute">Open source under the MIT license. Preview build; screening is not live yet.</p>
      </div>
    </div>
  );
}
