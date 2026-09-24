import {
  Marquee,
  PixelButton,
  TelemetryStrip,
} from "@/components/pixel";
import { Roulette } from "@/components/roulette";

const PX = { fontFamily: "var(--font-px)" } as const;

export default function Home() {
  return (
    <div id="top" className="flex flex-col">
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden border-b-2 border-[var(--color-ash)] bg-[var(--color-void)]">
        <div className="dotgrid absolute inset-0" aria-hidden />
        <div
          className="absolute top-0 right-0 hidden p-4 text-right text-xl leading-tight text-[var(--color-ash)] lg:block"
          aria-hidden
        >
          XP: FATE LEVEL 03<br />
          {"<3"} PROTOCOL LINK: STABLE
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-14 pb-10 sm:pt-20">
          <p style={PX} className="text-[10px] text-[var(--color-gold)]">
            {"// FAN-MADE VALORANT FATE MACHINE"}
          </p>
          <h1
            style={PX}
            className="max-w-4xl text-3xl leading-[1.25] text-[var(--color-bone)] sm:text-5xl"
          >
            WHO ARE
            <br />
            YOU <span className="text-[var(--color-blood)]">PLAYING?</span>
          </h1>
          <p className="max-w-xl text-2xl leading-snug text-[var(--color-smoke)]">
            Let fate choose your Agent.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#roll">
              <PixelButton variant="blood">[ ROLL AGENT ]</PixelButton>
            </a>
            <a href="/chaos">
              <PixelButton>[ CHAOS MODE ]</PixelButton>
            </a>
          </div>
          <p className="text-xl text-[var(--color-ash)]">
            {"// 29 AGENTS // 21 GUNS // 0 REROLLS"}
          </p>
        </div>
      </section>

      <Marquee
        items={[
          "NO REROLLS",
          "LET FATE DECIDE",
          "LOCK IT IN",
          "YOUR FATE HAS BEEN DECIDED",
          "DON'T BLAME US",
        ]}
      />

      {/* ----------------------------- TELEMETRY ----------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-8" aria-label="Session telemetry">
        <TelemetryStrip />
      </section>

      {/* ------------------------------ ROULETTE ------------------------------ */}
      <section id="roll" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-8">
        <Roulette />
      </section>
    </div>
  );
}
