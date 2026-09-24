import type { Metadata } from "next";
import { ChallengeRoom } from "@/components/challenge-room";

export const metadata: Metadata = {
  title: "CHALLENGE ROOM // Valo Roulette",
  description:
    "Per-round challenge generator. 13 rounds minimum. Pistol round first. Budget-aware. Ability-aware. Track. Score. Flex.",
  openGraph: {
    title: "CHALLENGE ROOM // Valo Roulette",
    description:
      "Generate each round. Mark complete. Score at the end. No rerolls.",
  },
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function ChallengeRoomPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// ROUND BY ROUND"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          CHALLENGE <span className="text-[var(--color-blood)]">ROOM</span>
        </h1>
        <p className="mt-2 max-w-2xl text-2xl text-[var(--color-smoke)]">
          One round at a time. Pistol first. Budget scales. Abilities matter.
          Minimum 13 rounds. Score at the end.
        </p>
      </div>
      <ChallengeRoom />
    </div>
  );
}