import type { Metadata } from "next";
import { ArmoryGrid, WeaponRoulette } from "@/components/armory";

export const metadata: Metadata = {
  title: "WEAPON ROULETTE // Valo Roulette",
  description:
    "Roll a random VALORANT weapon. Full armory price list included.",
};

const PX = { fontFamily: "var(--font-px)" } as const;

export default function WeaponsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <p style={PX} className="text-[10px] text-[var(--color-gold)]">
          {"// GUN GAME"}
        </p>
        <h1 style={PX} className="mt-3 text-2xl text-[var(--color-bone)] sm:text-3xl">
          WEAPON <span className="text-[var(--color-blood)]">ROULETTE</span>
        </h1>
      </div>
      <WeaponRoulette />
      <ArmoryGrid />
    </div>
  );
}
