import type { Metadata } from "next";
import { ChallengeRunBoard } from "@/components/showcase";
import { ShowcaseGallery } from "@/components/showcase";

export const metadata: Metadata = {
  title: "CHALLENGE // Valo Roulette",
  description:
    "Track your challenge runs. Quick stamp or detailed round-by-round mode. Compare all completed runs.",
  openGraph: {
    title: "CHALLENGE // Valo Roulette",
    description:
      "Quick stamp or round-by-round tracking. Your fate, your proof.",
  },
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function ChallengeRunPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// PROOF OF FATE"}
        </p>
        <h1 style={PX} className="mt-3 text-xl text-[var(--color-bone)] sm:text-2xl md:text-3xl">
          <span className="text-[var(--color-blood)]">CHALLENGE</span> TRACKER
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-smoke)] sm:text-xl md:text-2xl">
          Quick stamp or track round-by-round. Compare your completed runs.
        </p>
      </div>
      <ChallengeRunBoard />
      <div className="mt-8">
        <ShowcaseGallery />
      </div>
    </div>
  );
}