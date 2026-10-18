import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["600", "800"] });

export const metadata: Metadata = {
  title: "Edits Museum",
  description: "The hardest edits on the internet, and everything you need to make your own.",
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} antialiased`}>
      <body className="min-h-dvh bg-ink text-bone">
        <div className="mx-auto flex max-w-[1280px]">
          <Nav />
          <main className="min-h-dvh flex-1 border-line pb-16 sm:border-x md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
