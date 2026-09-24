import type { Metadata } from "next";
import { ShowcaseGallery } from "@/components/showcase";

export const metadata: Metadata = {
  title: "SHOWCASE // Valo Roulette",
  description:
    "Compare all challenge runs. Browse the hall of fate, filter by agent, status, and weapon. See who cleared what.",
  openGraph: {
    title: "SHOWCASE // Valo Roulette",
    description:
      "Hall of fate. Compare all challenge runs. Filter and browse.",
  },
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function ShowcasePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// COMPARE & FILTER"}
        </p>
        <h1 style={PX} className="mt-3 text-xl text-[var(--color-bone)] sm:text-2xl md:text-3xl">
          <span className="text-[var(--color-blood)]">SHOWCASE</span>
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-smoke)] sm:text-xl md:text-2xl">
          Compare all completed runs. Filter by agent, weapon, status.
        </p>
      </div>
      <ShowcaseGallery />
    </div>
  );
}