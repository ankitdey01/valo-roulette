import type { Metadata } from "next";
import { Daily } from "@/components/panels";

export const metadata: Metadata = {
  title: "DAILY GAUNTLET // Valo Roulette",
  description:
    "One agent, one mission, ten trials. Clear them all and your card unlocks.",
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function DailyPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// ONE DAY ONLY"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          DAILY <span className="text-[var(--color-blood)]">GAUNTLET</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          Mission clears at midnight UTC. Trials are random per player.
          No two days alike.
        </p>
      </div>
      <Daily />
    </div>
  );
}
