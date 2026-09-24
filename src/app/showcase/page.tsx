import type { Metadata } from "next";
import { ShowcaseGallery } from "@/components/showcase";

export const metadata: Metadata = {
  title: "SHOWCASE // Valo Roulette",
  description:
    "Browse the hall of fate. Compare challenge runs, filter by agent, status, and weapon. See who cleared what.",
  openGraph: {
    title: "SHOWCASE // Valo Roulette",
    description:
      "Hall of fate. Compare challenge runs. No rerolls.",
  },
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function ShowcasePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// HALL OF FATE"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          <span className="text-[var(--color-blood)]">SHOWCASE</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          Every completed run. Filter. Compare. Flex.
        </p>
      </div>
      <ShowcaseGallery />
    </div>
  );
}