export function PageHeader({ title, sub, display = false }: { title: string; sub?: string; display?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/80 px-4 py-3 backdrop-blur">
      <h1 className={display ? "font-display text-2xl font-extrabold tracking-wide text-gold" : "text-xl font-extrabold"}>{title}</h1>
      {sub && <p className="text-sm text-mute">{sub}</p>}
    </header>
  );
}
