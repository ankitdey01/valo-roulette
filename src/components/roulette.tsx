"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AGENTS,
  SYSTEM_LINES,
  agentByName,
  agentPhoto,
  pickRandom,
  quipFor,
  sfx,
  store,
  type Agent,
} from "@/lib/fate";
import { rollChallenge, runs } from "@/lib/runs";
import { HudLabel, PixelButton, WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;

type Phase = "idle" | "spinning" | "revealed";

function ShareCard({ agent, rollNo, streak }: { agent: Agent; rollNo: number; streak: number }) {
  const [copied, setCopied] = useState(false);
  const text = `YOUR FATE HAS BEEN DECIDED\n${agent.name} (${agent.role})\n${quipFor(agent.name)}\nROLL #${rollNo} // STREAK ${streak}\nNo rerolls. Lock it in.\nVALO ROULETTE`;

  return (
    <div className="relative z-10 border-2 border-[var(--color-blood)] bg-[var(--color-void)] p-4">
      <p style={PX} className="text-[9px] text-[var(--color-gold)]">
        YOUR FATE HAS BEEN DECIDED
      </p>
      <p style={PX} className="mt-3 text-xl text-[var(--color-bone)] sm:text-2xl">
        {agent.name}
      </p>
      <p className="mt-1 text-lg text-[var(--color-smoke)] sm:text-xl">
        {agent.role} {"//"} ROLL #{rollNo}
      </p>
      <p className="mt-2 text-lg text-[var(--color-bone)] sm:text-xl">{quipFor(agent.name)}</p>
      <p style={PX} className="mt-3 text-[9px] text-[var(--color-ash)]">
        VALO ROULETTE /// NO REROLLS
      </p>
      <PixelButton
        variant="ghost"
        className="mt-4 w-full border-2 border-[var(--color-ash)]"
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? "[ COPIED ]" : "[ SHARE RESULT ]"}
      </PixelButton>
    </div>
  );
}

export function Roulette() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycleName, setCycleName] = useState("???");
  const [lines, setLines] = useState<string[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [poolReset, setPoolReset] = useState(false);
  const [suspicious, setSuspicious] = useState(false);
  const [rollNo, setRollNo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [locked, setLocked] = useState(true);
  // Pool count mirrors localStorage but must hydrate after mount:
  // reading storage during render mismatches the prerendered HTML.
  const [poolLeft, setPoolLeft] = useState(29);
  const recentRef = useRef<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // Hydrate streak/roll counts from localStorage after mount (see pixel.tsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(store.getStreak());
    setRollNo(store.totalRolls());
    setPoolLeft(29 - store.getSeen().length);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function roll() {
    if (phase === "spinning") return;
    clearTimers();

    // Reroll without locking breaks the streak.
    if (phase === "revealed" && !locked) {
      store.setStreak(0);
      setStreak(0);
    }

    const seen = store.getSeen();
    const pool = AGENTS.filter((a) => !seen.includes(a.name));
    const reset = pool.length === 0;
    const target = pickRandom(reset ? AGENTS : pool);
    setPoolReset(reset);
    setSuspicious(false);

    setPhase("spinning");
    setAgent(null);
    setLines([]);

    SYSTEM_LINES.forEach((line, i) => {
      timers.current.push(
        window.setTimeout(() => setLines((l) => [...l, line]), 180 * (i + 1)),
      );
    });

    // Stepped ease-out cycle, ~2.2s of arcade scramble.
    const TICKS = 26;
    for (let i = 0; i < TICKS; i++) {
      const delay = 120 + Math.pow(i / TICKS, 2.2) * 1900;
      timers.current.push(
        window.setTimeout(() => {
          setCycleName(pickRandom(AGENTS).name.toUpperCase());
          sfx.tick();
        }, 1100 + delay * 0.28),
      );
    }

    timers.current.push(
      window.setTimeout(() => {
        setAgent(target);
        setCycleName(target.name.toUpperCase());
        setPhase("revealed");
        setLocked(false);
        sfx.lock();
        setShakeKey((k) => k + 1);

        const nextSeen = reset ? [target.name] : [...seen, target.name];
        store.setSeen(nextSeen);
        store.bumpRolls(target.name);
        const n = store.totalRolls();
        setRollNo(n);
        setPoolLeft(29 - nextSeen.length);

        const recent = [...recentRef.current, target.name].slice(-3);
        recentRef.current = recent;
        if (recent.length === 3 && recent.every((r) => r === target.name)) {
          setSuspicious(true);
        }
      }, 2100),
    );
  }

  function lockIn() {
    if (phase !== "revealed" || !agent || locked) return;
    setLocked(true);
    const n = store.getStreak() + 1;
    store.setStreak(n);
    setStreak(n);
    sfx.lock();
  }

  return (
    <WindowCard
      title="AGENT ROULETTE // FATE.EXE"
      right={phase === "spinning" ? "ROLLING" : phase === "revealed" ? "LOCKED?" : "READY"}
      hot={phase === "revealed"}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* chamber */}
        <div className="scanlines relative z-0 flex min-h-[380px] flex-col justify-between overflow-hidden border-2 border-[var(--color-edge)] bg-[var(--color-void)] p-5">
          <div className="flex flex-col gap-1" aria-live="polite">
            {phase === "idle" && (
              <p className="text-xl text-[var(--color-ash)] sm:text-2xl">
                {"// AWAITING INPUT. PRESS ROLL AGENT."}
              </p>
            )}
            {lines.map((l) => (
              <p key={l} className="text-lg text-[var(--color-smoke)] sm:text-xl md:text-2xl">
                {">>>"} {l}
              </p>
            ))}
          </div>

          <div key={shakeKey} className={phase === "revealed" ? "anim-shake" : ""}>
            {phase === "revealed" && agent ? (
              <div className="anim-flash -m-1 p-1">
                <p style={PX} className="text-[10px] text-[var(--color-gold)]">
                  YOUR FATE HAS BEEN DECIDED
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agentPhoto(agent)}
                    alt={`${agent.name} portrait`}
                    width={120}
                    height={120}
                    className="px-img corner-tick border-2 border-[var(--color-blood)] bg-[var(--color-panel)] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div>
                    <p
                      style={PX}
                      className="text-2xl text-[var(--color-bone)] sm:text-3xl md:text-4xl"
                    >
                      {agent.name.toUpperCase()}
                    </p>
                    <p className="mt-2 text-xl text-[var(--color-smoke)] sm:text-2xl">
                      {agent.role} {"//"} {agent.gender}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-lg text-[var(--color-bone)] sm:text-xl md:text-2xl">
                  {quipFor(agent.name)}
                </p>
                {poolReset && (
                  <p className="mt-2 text-lg text-[var(--color-gold)] sm:text-xl md:text-2xl">
                    {"// POOL EXHAUSTED. ALL 29 SEEN. POOL RESET."}
                  </p>
                )}
                {suspicious && (
                  <p className="mt-2 text-lg text-[var(--color-blood)] sm:text-xl md:text-2xl">
                    {"// STATISTICALLY SUSPICIOUS. THREE IN A ROW. WE ARE WATCHING."}
                  </p>
                )}
              </div>
            ) : (
              <p
                style={PX}
                className={`text-4xl sm:text-5xl ${phase === "spinning" ? "anim-cycling text-[var(--color-blood)]" : "text-[var(--color-edge)]"}`}
              >
                {phase === "spinning" ? cycleName : "???"}
              </p>
            )}
          </div>

          <div className="relative z-10 mt-4 flex flex-col gap-3 sm:flex-row">
            <PixelButton 
              variant="blood" 
              onClick={() => roll()} 
              className="flex-1 w-full sm:w-auto"
              disabled={phase === "spinning"}
            >
              {phase === "spinning" ? "[ ROLLING... ]" : "[ ROLL AGENT ]"}
            </PixelButton>
            {phase === "revealed" && agent && (
              <PixelButton 
                onClick={() => lockIn()} 
                className="flex-1 w-full sm:w-auto"
                disabled={locked}
              >
                {locked ? "[ LOCKED IN ]" : "[ LOCK IN ]"}
              </PixelButton>
            )}
          </div>
          {phase === "revealed" && agent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                runs.setActive(rollChallenge(agent.name));
                router.push("/challenge-run");
              }}
              className="relative z-10 mt-4 touch-manipulation block w-full cursor-pointer border-2 border-[var(--color-gold)] bg-[var(--color-void)] px-4 py-3 text-left text-base text-[var(--color-gold)] active:bg-[var(--color-gold)] active:bg-opacity-10 sm:text-lg"
            >
              {"[ START CHALLENGE >>> ]"}
            </button>
          )}
          <p className="relative z-10 mt-3 text-lg text-[var(--color-ash)] sm:text-xl">
            {"// No duplicates until all 29 are seen."}
          </p>
        </div>

        {/* side readout */}
        <div className="flex flex-col gap-4">
          <div className="border-2 border-[var(--color-ash)] bg-[var(--color-void)] p-4">
            <HudLabel k="STREAK" v={String(streak).padStart(2, "0")} />
            <div className="mt-2">
              <HudLabel k="ROLL NO" v={String(rollNo)} />
            </div>
            <div className="mt-2">
              <HudLabel k="POOL LEFT" v={`${poolLeft}/29`} />
            </div>
            <p className="mt-3 text-xl leading-tight text-[var(--color-ash)]">
              Lock to grow the streak. Reroll resets it.
            </p>
          </div>
          {phase === "revealed" && agent && (
            <ShareCard agent={agent} rollNo={rollNo} streak={streak} />
          )}
          {phase === "revealed" && agent && (
            <details className="border-2 border-[var(--color-ash)] bg-[var(--color-void)] p-4">              <summary
                className="cursor-pointer text-xl text-[var(--color-gold)]"
              >
                [+] FILE: {agent.name.toUpperCase()} ABILITIES
              </summary>
              <ul className="mt-3 flex flex-col gap-2">
                {agentByName(agent.name).abilities.map((ab) => (
                  <li key={ab.name} className="text-xl leading-tight">
                    <span className="text-[var(--color-bone)]">{ab.name}</span>{" "}
                    <span className="text-[var(--color-blood)]">[{ab.cost}]</span>
                    <br />
                    <span className="text-[var(--color-smoke)]">{ab.description}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </WindowCard>
  );
}
