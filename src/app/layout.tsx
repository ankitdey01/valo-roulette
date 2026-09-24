import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { HudNav } from "@/components/pixel";
import { SITE_URL } from "@/lib/runs";
import { Analytics } from "@vercel/analytics/next";

const px = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-px",
});

const hud = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hud",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VALO ROULETTE // Let Fate Decide",
    template: "%s // VALO ROULETTE",
  },
  description:
    "A fan-made VALORANT playground. Roll your Agent, accept chaos, stamp the challenge, flex the banner. No rerolls.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "VALO ROULETTE",
    title: "VALO ROULETTE // Let Fate Decide",
    description:
      "You don't pick your Agent. Fate does. Roll, lock, play. No rerolls.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VALO ROULETTE // Who are you playing?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VALO ROULETTE // Let Fate Decide",
    description:
      "You don't pick your Agent. Fate does. Roll, lock, play. No rerolls.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${px.variable} ${hud.variable}`}>
      <body className="dotgrid flex min-h-full flex-col antialiased">
        <HudNav />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t-2 border-[var(--color-ash)] bg-[var(--color-void)]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6">
            <p
              className="text-sm uppercase tracking-widest text-[var(--color-gold)]"
              style={{ fontFamily: "var(--font-px)" }}
            >
              VALO ROULETTE
            </p>
            <p className="text-xl leading-tight text-[var(--color-smoke)]">
              Unofficial fan project. Not affiliated with or endorsed by Riot
              Games. VALORANT and all agent names are trademarks of Riot
              Games, Inc.
            </p>
            <p className="text-xl text-[var(--color-ash)]">
              [ ROLL // LOCK // PLAY ] /// NO REROLLS /// DON&apos;T BLAME US
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
