export const metadata = { title: "Edits Museum · United States only" };

export default function UsOnly() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <p className="display text-4xl text-accent">Edits Museum</p>
      <h1 className="mt-4 text-xl font-extrabold">Available in the United States only</h1>
      <p className="mt-2 max-w-sm text-sm text-mute">Edits Museum isn&apos;t available in your region yet.</p>
    </div>
  );
}
