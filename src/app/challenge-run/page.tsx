import type { Metadata } from "next";
import { ShowcaseBoard } from "@/components/showcase";

export const metadata: Metadata = {
  title: "CHALLENGE RUN // Valo Roulette",
  description:
    "Start a fated challenge, stamp it cleared or failed, and flex the banner on X, WhatsApp, Telegram, and Instagram.",
  openGraph: {
    title: "CHALLENGE RUN // Valo Roulette",
    description:
      "Start a run. Stamp it. Flex the banner everywhere.",
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
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          CHALLENGE <span className="text-[var(--color-blood)]">RUN</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          Start a run. Stamp it. Flex the banner.
        </p>
      </div>
      <ShowcaseBoard />
    </div>
  );
}