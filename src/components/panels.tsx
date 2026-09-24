"use client";

import { useEffect, useRef, useState } from "react";
import {
  agentPhoto,
  dailyFor,
  store,
  type Agent,
  type DailySpec,
} from "@/lib/fate";
import { CardShare, DAILY_URL, paintDailyCard } from "@/components/showcase";
import { PixelButton, WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;
const PROGRESS_KEY = "valo-daily-progress";

type Progress = {
  mission: boolean;
  tiles: boolean[];
};

const FRESH: Progress = { mission: false, tiles: Array(9).fill(false) };

function DailyPreview({
  agent,
  challenge,
  label,
}: {
  agent: Agent;
  challenge: string;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let live = true;
    paintDailyCard(agent, challenge, label)
      .then((cv) => {
        if (!live || !ref.current) return;
        const dst = ref.current;
        dst.width = cv.width;
        dst.height = cv.height;
        dst.getContext("2d")?.drawImage(cv, 0, 0);
      })
      .catch(() => {
        /* paint failed, share text still works */
      });
    return () => {
      live = false;
    };
  }, [agent, challenge, label]);

  return (
    <canvas
      ref={ref}
      className="px-img w-full border-2 border-[var(--color-gold)]"
      aria-label={`Daily banner for ${agent.name}`}
    />
  );
}

export function Daily() {
  const [spec, setSpec] = useState<(DailySpec & { label: string }) | null>(null);
  const [progress, setProgress] = useState<Progress>(FRESH);

  useEffect(() => {
    // Seeded by UTC date + per-player id: stable all day, unique per player.
    // Computed after mount so prerendered HTML stays neutral (no mismatch).
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const s = dailyFor(day, store.getUid());
    let p: Progress = { mission: false, tiles: Array(9).fill(false) };
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved?.day === day &&
          typeof saved?.mission === "boolean" &&
          Array.isArray(saved?.tiles) &&
          saved.tiles.length === 9
        ) {
          p = { mission: saved.mission, tiles: saved.tiles };
        }
      }
    } catch {
      /* fresh gauntlet */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpec({ ...s, label: day });
    setProgress(p);
  }, []);

  function save(next: Progress) {
    setProgress(next);
    try {
      window.localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({
          day: spec?.label ?? "",
          mission: next.mission,
          tiles: next.tiles,
        }),
      );
    } catch {
      /* noop */
    }
  }

  if (!spec) {
    return (
      <WindowCard title="DAILY GAUNTLET // LOADING" right="...">
        <p className="text-2xl text-[var(--color-ash)]">
          {"// Opening today's file..."}
        </p>
      </WindowCard>
    );
  }

  const { agent, challenge, trials, label } = spec;
  const cleared = progress.tiles.filter(Boolean).length + (progress.mission ? 1 : 0);
  const done = cleared === 10;

  const caption =
    `ROLL. LOCK. PLAY.\n` +
    `\n` +
    `DAILY GAUNTLET // ${label} // 10/10 CLEARED\n` +
    `${agent.name} (${agent.role})\n` +
    `Mission: ${challenge}\n` +
    `Trials: ${trials.join(" / ")}\n` +
    `VALO ROULETTE. No rerolls.\n` +
    `\n` +
    `Roll your fate: ${DAILY_URL}`;

  const tileBtn = (on: boolean) =>
    `min-h-20 w-full cursor-pointer border-2 p-2 text-[8px] leading-relaxed sm:text-[9px] ${
      on
        ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)] line-through"
        : "border-[var(--color-ash)] text-[var(--color-smoke)] hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
    }`;

  return (
    <WindowCard
      title="DAILY GAUNTLET // ONE DAY ONLY"
      right={`${label} /// ${cleared}/10`}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={agentPhoto(agent)}
          alt={`${agent.name} portrait`}
          width={96}
          height={96}
          loading="lazy"
          className="px-img border-2 border-[var(--color-gold)] object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="min-w-48 flex-1">
          <p style={PX} className="text-xl text-[var(--color-bone)]">
            {agent.name.toUpperCase()}
          </p>
          <p className="mt-1 text-xl text-[var(--color-smoke)]">
            {agent.role} {"//"} PLAY TODAY OR LOSE IT
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => save({ ...progress, mission: !progress.mission })}
        aria-pressed={progress.mission}
        style={PX}
        className={`mt-4 w-full cursor-pointer border-2 p-4 text-left text-[10px] leading-relaxed ${
          progress.mission
            ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)] line-through"
            : "border-[var(--color-gold)] text-[var(--color-bone)]"
        }`}
      >
        {progress.mission ? "[X] MISSION: " : "[ ] MISSION: "}
        {challenge.toUpperCase()}
      </button>

      <ul className="mt-2 grid grid-cols-3 gap-2">
        {trials.map((t, i) => (
          <li key={`${label}-${t}`}>
            <button
              type="button"
              onClick={() =>
                save({
                  ...progress,
                  tiles: progress.tiles.map((v, j) => (j === i ? !v : v)),
                })
              }
              aria-pressed={progress.tiles[i]}
              style={PX}
              className={tileBtn(progress.tiles[i])}
            >
              {progress.tiles[i] ? "[X] " : "[ ] "}
              {t.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>

      {done ? (
        <div className="mt-4 flex flex-col gap-3">
          <p style={PX} className="text-[11px] text-[var(--color-blood)]">
            GAUNTLET CLEARED. CARD UNLOCKED.
          </p>
          <DailyPreview agent={agent} challenge={challenge} label={label} />
          <CardShare
            caption={caption}
            filename={`valo-daily-${label.toLowerCase()}.png`}
            paint={() => paintDailyCard(agent, challenge, label)}
            pageUrl={DAILY_URL}
          />
        </div>
      ) : (
        <PixelButton
          variant="ghost"
          className="mt-4 w-full cursor-default border-2 border-[var(--color-edge)] opacity-70"
          onClick={() => {}}
        >
          [ CARD LOCKS AT 10/10 ]
        </PixelButton>
      )}
    </WindowCard>
  );
}
