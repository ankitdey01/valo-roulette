import type { Metadata } from "next";
import { ChaosChamber } from "@/components/chaos";

export const metadata: Metadata = {
  title: "CHAOS TERMINAL // Valo Roulette",
  description:
    "Generate cursed VALORANT loadouts: agent, weapon, challenge, modifier. Send the run to the challenge run tracker.",
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function ChaosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// PARTY PROTOCOLS"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          CHAOS <span className="text-[var(--color-blood)]">TERMINAL</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          A whole situation. Send results to the challenge run tracker.
        </p>
      </div>
      <ChaosChamber />
    </div>
  );
}
