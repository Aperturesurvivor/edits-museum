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
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/hall") : path.startsWith(href));
  return (
    <>
      <nav className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-1 py-4 sm:flex xl:w-64 xl:items-start xl:px-4">
        <Link href="/" className="mb-4 flex items-center gap-3 px-3 py-2">
          <span className="font-display text-2xl font-extrabold text-gold">EM</span>
          <span className="hidden text-lg font-extrabold tracking-tight xl:inline">Edits Museum</span>
        </Link>
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href}
            className={`flex items-center gap-4 rounded-full px-3 py-3 text-xl transition-colors hover:bg-white/10 ${active(i.href) ? "font-extrabold text-bone" : "text-bone/80"}`}>
            <span className={active(i.href) ? "text-gold" : ""}><Icon d={i.icon} /></span>
            <span className="hidden xl:inline">{i.label}</span>
          </Link>
        ))}
        <Link href="/submit" className="mt-4 hidden w-full rounded-full bg-gold py-3 text-center font-bold text-black hover:bg-gold/90 xl:block">
          Submit an edit
        </Link>
        <Link href="/about" className="mt-auto px-3 text-xs text-mute hover:underline">About & rules</Link>
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-line bg-black/90 py-2 backdrop-blur sm:hidden">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} aria-label={i.label} className={`p-2 ${active(i.href) ? "text-gold" : "text-bone/80"}`}>
            <Icon d={i.icon} />
          </Link>
        ))}
      </nav>
    </>
  );
}
