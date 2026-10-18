export function PageHeader({ title, sub, display = false }: { title: string; sub?: string; display?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/80 px-4 py-3 backdrop-blur sm:px-5">
      <h1 className={display ? "display text-3xl" : "text-xl font-extrabold"}>{title}</h1>
      {sub && <p className="text-sm text-mute">{sub}</p>}
    </header>
  );
}
