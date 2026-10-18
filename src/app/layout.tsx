import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { PlayerProvider } from "@/components/Player";
import { RightRail } from "@/components/RightRail";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Barlow_Condensed({ variable: "--font-display-face", subsets: ["latin"], weight: ["700", "800", "900"] });

export const metadata: Metadata = {
  title: "Edits Museum: the greatest edits on Earth",
  description: "American-made pride, cut to music. The greatest edits on Earth, and everything you need to make your own.",
  // X's video CDN rejects foreign Referer headers; send none so hotlinked MP4s stream.
  referrer: "no-referrer",
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden bg-ink text-bone">
        <PlayerProvider>
          <div className="mx-auto flex w-full max-w-[1280px] justify-center">
            <Nav />
            <main className="min-h-dvh w-full min-w-0 max-w-[700px] border-line pb-14 sm:border-x sm:pb-0 lg:flex-1">{children}</main>
            <Suspense fallback={<div className="hidden w-[320px] shrink-0 lg:block" />}>
              <RightRail />
            </Suspense>
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
