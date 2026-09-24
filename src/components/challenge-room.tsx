"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Agent,
  AGENTS,
  WEAPON_META,
  pickRandom,
  shuffle,
} from "@/lib/fate";
import { runs, type ChallengeRun } from "@/lib/runs";
import { PixelButton, WindowCard, HudLabel } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;

const ROUND_KEY = "valo-round-challenges";
const RUN_KEY = "valo-active-room-run";

export type RoundChallenge = {
  round: number;
  challenge: string;
  budget: number;
  weaponPool: string[];
  abilityFocus: string | null;
  completed: boolean | null;
  notes: string;
};

const ABILITY_FOCUSES = [
  "Use your signature ability for a kill",
  "Use your ultimate for a kill or assist",
  "Coordinate two abilities in one play",
  "Deny area with utility for 10+ seconds",
  "Flash/concuss enemies before peeking",
  "Gather info with recon/scan ability",
  "Self-heal or heal teammate mid-fight",
  "Create space with movement ability",
  "Block vision with smoke/wall",
  "None — gunplay only",
] as const;

const ROUND_TYPES = [
  { label: "PISTOL", minRound: 1, maxRound: 1, budget: 800 },
  { label: "ECO / LIGHT BUY", minRound: 2, maxRound: 3, budget: 2000 },
  { label: "FIRST FULL BUY", minRound: 4, maxRound: 5, budget: 4500 },
  { label: "MID-GAME", minRound: 6, maxRound: 10, budget: 5000 },
  { label: "LATE GAME / OT", minRound: 11, maxRound: 24, budget: 6000 },
] as const;

function roundTypeFor(n: number) {
  return ROUND_TYPES.find((t) => n >= t.minRound && n <= t.maxRound) ?? ROUND_TYPES[3];
}

function affordableWeapons(budget: number): string[] {
  return WEAPON_META.filter((w) => w.price <= budget).map((w) => w.name);
}

function generateRoundChallenge(
  round: number,
  agent: Agent,
  runWeapon: string,
): RoundChallenge {
  const type = roundTypeFor(round);
  const pool = affordableWeapons(type.budget);
  const hasRunWeapon = pool.includes(runWeapon);

  let weaponPool: string[];
  if (round === 1) {
    weaponPool = pool.filter((w) => WEAPON_META.find((m) => m.name === w)?.type === "Sidearm");
    if (weaponPool.length === 0) weaponPool = pool.slice(0, 3);
  } else if (hasRunWeapon && Math.random() < 0.6) {
    weaponPool = [runWeapon, ...shuffle(pool.filter((w) => w !== runWeapon)).slice(0, 2)];
  } else {
    weaponPool = shuffle(pool).slice(0, 3);
  }

  const abilityFocus = Math.random() < 0.5 ? pickRandom([...ABILITY_FOCUSES]) : null;

  const templates = [
    `Round ${round} (${type.label}): Get a kill with ${weaponPool.join(" / ")}.`,
    `Round ${round} (${type.label}): Survive the round with ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Entry first using ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Hold angle and get 2+ kills with ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Retake site using only ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): No armor this round. Weapon: ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Trade a teammate's death with ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Clutch a 1vX with ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Get first blood with ${weaponPool[0]}.`,
    `Round ${round} (${type.label}): Plant/defuse and get a kill with ${weaponPool[0]}.`,
  ];

  let challenge = pickRandom(templates);

  if (abilityFocus && abilityFocus !== "None — gunplay only") {
    challenge += ` ${abilityFocus}.`;
  } else if (abilityFocus === "None — gunplay only") {
    challenge += ` No abilities purchased.`;
  }

  if (round === 1) {
    challenge = `PISTOL ROUND: ${challenge.replace(`Round ${round} (${type.label}): `, "")}`;
  }

  return {
    round,
    challenge,
    budget: type.budget,
    weaponPool,
    abilityFocus,
    completed: null,
    notes: "",
  };
}

export function ChallengeRoom() {
  const router = useRouter();
  const [run, setRun] = useState<ChallengeRun | null>(null);
  const [rounds, setRounds] = useState<RoundChallenge[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [matchEnded, setMatchEnded] = useState(false);
  const [score, setScore] = useState<{ earned: number; total: number; pct: number } | null>(null);

  useEffect(() => {
    const active = runs.getActive();
    if (!active) {
      router.push("/challenge-run");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRun(active);

    let saved: RoundChallenge[] = [];
    try {
      const raw = window.localStorage.getItem(ROUND_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch { /* noop */ }

    let savedRunId = "";
    try {
      savedRunId = window.localStorage.getItem(RUN_KEY) ?? "";
    } catch { /* noop */ }

    if (savedRunId === active.id && saved.length > 0) {
      setRounds(saved);
      const lastCompleted = saved.filter((r) => r.completed !== null).length;
      setCurrentRound(Math.max(1, lastCompleted + 1));
      if (saved.length >= 13 && saved.every((r) => r.completed !== null)) {
        setMatchEnded(true);
        computeScore(saved);
      }
    } else {
      const first = generateRoundChallenge(1, agentByName(active), active.weapon);
      const initial = [first];
      setRounds(initial);
      persist(initial, active.id);
    }
  }, [router]);

  function persist(next: RoundChallenge[], runId: string) {
    setRounds(next);
    try {
      window.localStorage.setItem(ROUND_KEY, JSON.stringify(next));
      window.localStorage.setItem(RUN_KEY, runId);
    } catch { /* noop */ }
  }

  function computeScore(list: RoundChallenge[]) {
    const played = list.filter((r) => r.completed !== null);
    const earned = played.filter((r) => r.completed === true).length;
    const total = played.length;
    setScore({ earned, total, pct: total > 0 ? Math.round((earned / total) * 100) : 0 });
  }

  function agentByName(active: ChallengeRun): Agent {
    const found = AGENTS.find((a) => a.name === active.agent);
    return found ?? pickRandom(AGENTS);
  }

  function generateForCurrent() {
    if (!run) return;
    const next = generateRoundChallenge(currentRound, agentByName(run), run.weapon);
    const updated = [...rounds, next];
    persist(updated, run.id);
    setCurrentRound(currentRound + 1);
  }

  function toggleRound(idx: number, val: boolean) {
    const updated = rounds.map((r, i) => (i === idx ? { ...r, completed: val } : r));
    persist(updated, run!.id);
    if (updated.length >= 13 && updated.every((r) => r.completed !== null)) {
      setMatchEnded(true);
      computeScore(updated);
    }
  }

  function addNotes(idx: number, notes: string) {
    const updated = rounds.map((r, i) => (i === idx ? { ...r, notes } : r));
    persist(updated, run!.id);
  }

  function endMatchEarly() {
    if (rounds.filter((r) => r.completed !== null).length < 13) {
      if (!window.confirm("Minimum 13 rounds required. End anyway?")) return;
    }
    setMatchEnded(true);
    computeScore(rounds);
  }

  function resetRoom() {
    if (!run) return;
    if (!window.confirm("Reset this challenge room? All progress lost.")) return;
    try {
      window.localStorage.removeItem(ROUND_KEY);
      window.localStorage.removeItem(RUN_KEY);
    } catch { /* noop */ }
    const first = generateRoundChallenge(1, agentByName(run), run.weapon);
    setRounds([first]);
    setCurrentRound(2);
    setMatchEnded(false);
    setScore(null);
  }

  if (!run) return null;

  const playedRounds = rounds.filter((r) => r.completed !== null);
  const completedCount = playedRounds.filter((r) => r.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <WindowCard title={`CHALLENGE ROOM // ${run.agent.toUpperCase()} [${run.role}]`} right={`${rounds.length} ROUNDS`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <HudLabel k="WEAPON" v={`${run.weapon} ONLY`} />
          <HudLabel k="MISSION" v={run.challenge} />
          <HudLabel k="MODIFIER" v={run.modifier} />
        </div>
        <p className="text-lg text-[var(--color-smoke)]">
          Generate each round. Mark complete or fail. Minimum 13 rounds to score.
        </p>

        {score && (
          <div className="mt-4 p-4 border-2 border-[var(--color-blood)] bg-[var(--color-void)]">
            <p style={PX} className="text-[10px] text-[var(--color-blood)]">
              MATCH COMPLETE — FINAL SCORE
            </p>
            <p className="mt-2 text-4xl text-[var(--color-bone)]">
              {score.earned} / {score.total} ROUNDS CLEARED <span className="text-[var(--color-gold)]">({score.pct}%)</span>
            </p>
            <p className="mt-1 text-xl text-[var(--color-ash)]">
              {score.pct >= 80 ? "DOMINANT." : score.pct >= 60 ? "SOLID." : score.pct >= 40 ? "SHAKY." : "FATE DENIED."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <PixelButton variant="blood" onClick={() => router.push("/challenge-run")}>
                [ RETURN TO CHALLENGE RUN ]
              </PixelButton>
              <PixelButton onClick={resetRoom}>[ NEW MATCH ]</PixelButton>
            </div>
          </div>
        )}

        {!matchEnded && (
          <div className="mt-4 flex flex-wrap gap-3">
            {rounds.some((r) => r.round === currentRound) ? (
              <PixelButton
                variant="ghost"
                className="flex-1 min-w-[200px] cursor-default border-2 border-[var(--color-edge)] opacity-70"
                onClick={() => {}}
              >
                [ ROUND EXISTS ]
              </PixelButton>
            ) : (
              <PixelButton
                variant="blood"
                className="flex-1 min-w-[200px]"
                onClick={generateForCurrent}
              >
                [ GENERATE ROUND {currentRound} ]
              </PixelButton>
            )}
            <PixelButton variant="ghost" onClick={endMatchEarly} className="flex-1 min-w-[200px]">
              [ END MATCH & SCORE ]
            </PixelButton>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm" style={PX}>
            <thead>
              <tr className="border-b-2 border-[var(--color-ash)] text-[var(--color-gold)]">
                <th className="p-2 w-16">ROUND</th>
                <th className="p-2">CHALLENGE</th>
                <th className="p-2 w-24">BUDGET</th>
                <th className="p-2 w-40">WEAPONS</th>
                <th className="p-2 w-20">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => (
                <tr key={r.round} className="border-b border-[var(--color-edge)]">
                  <td className="p-2 text-[var(--color-gold)]">{r.round}</td>
                  <td className="p-2 text-[var(--color-bone)] max-w-md">
                    <div>{r.challenge}</div>
                    {r.abilityFocus && (
                      <span className="block mt-1 text-[10px] text-[var(--color-blood)]">
                        ABILITY: {r.abilityFocus}
                      </span>
                    )}
                    {r.notes && (
                      <input
                        type="text"
                        value={r.notes}
                        onChange={(e) => addNotes(i, e.target.value)}
                        placeholder="Notes..."
                        className="mt-1 w-full text-[10px] border border-[var(--color-ash)] bg-[var(--color-void)] text-[var(--color-bone)] px-1"
                        style={PX}
                      />
                    )}
                  </td>
                  <td className="p-2 text-[var(--color-ash)]">${r.budget}</td>
                  <td className="p-2 text-[var(--color-smoke)]">{r.weaponPool.join(" / ")}</td>
                  <td className="p-2">
                    {r.completed === null ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRound(i, true)}
                          className="px-2 py-1 text-[9px] border border-[var(--color-blood)] text-[var(--color-blood)] hover:bg-[var(--color-blood)] hover:text-[var(--color-bone)]"
                          style={PX}
                        >
                          [ ✓ ]
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRound(i, false)}
                          className="px-2 py-1 text-[9px] border border-[var(--color-ash)] text-[var(--color-ash)] hover:bg-[var(--color-ash)] hover:text-[var(--color-void)]"
                          style={PX}
                        >
                          [ ✗ ]
                        </button>
                      </div>
                    ) : r.completed ? (
                      <span className="text-[var(--color-blood)]" style={PX}>CLEARED</span>
                    ) : (
                      <span className="text-[var(--color-ash)]" style={PX}>FAILED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-[var(--color-ash)]" style={PX}>
          PROGRESS: {playedRounds.length} PLAYED / {completedCount} CLEARED / {rounds.length} GENERATED
        </div>
      </WindowCard>
    </div>
  );
}