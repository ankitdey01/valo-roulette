import type { Metadata } from "next";
import { AGENTS } from "@/lib/fate";
import { Archive } from "@/components/archive";

export const metadata: Metadata = {
  title: "AGENT ARCHIVE // Valo Roulette",
  description:
    "The full VALORANT protocol roster. Open a classified file to inspect abilities and costs.",
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function AgentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// CLASSIFIED ROSTER"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          EXPLORE THE <span className="text-[var(--color-blood)]">AGENTS</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          Tap a file to inspect abilities and costs.
        </p>
      </div>
      <Archive agents={AGENTS} />
    </div>
  );
}
