"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Grand Hall", icon: "M3 21h18M5 21V10m14 11V10M9 21v-7m6 7v-7M2 10 12 3l10 7z" },
  { href: "/feed", label: "Feed", icon: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 6v6l5-3z" },
  { href: "/armory", label: "Armory", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/submit", label: "Submit", icon: "M12 5v14M5 12h14" },
  { href: "/onboarding", label: "Genres", icon: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/hall") : path.startsWith(href));
  return (
    <>
      <header className="sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col items-center py-3 sm:flex xl:w-[260px] xl:items-stretch xl:px-3">
        <Link href="/" className="mb-2 flex h-12 items-center gap-3 rounded-full px-3 hover:bg-white/10">
          <span className="display text-3xl text-accent">EM</span>
          <span className="hidden text-lg font-extrabold tracking-tight xl:inline">Edits Museum</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
              className={`flex h-12 items-center gap-4 rounded-full px-3 text-xl transition-colors hover:bg-white/10 ${active(i.href) ? "font-extrabold" : "text-bone/85"}`}>
              <span className={active(i.href) ? "text-accent" : ""}><Icon d={i.icon} /></span>
              <span className="hidden xl:inline">{i.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/submit" className="mt-4 hidden h-12 items-center justify-center rounded-full bg-accent text-[17px] font-bold text-black hover:bg-accent-deep xl:flex">
          Submit an edit
        </Link>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-line bg-black/90 backdrop-blur sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} aria-label={i.label} className={`p-2 ${active(i.href) ? "text-accent" : "text-bone/80"}`}>
            <Icon d={i.icon} />
          </Link>
        ))}
      </nav>
    </>
  );
}
