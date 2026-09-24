"use client";

import { useEffect, useState } from "react";
import {
  WEAPON_META,
  WEAPON_TYPES,
  pickRandom,
  sfx,
  weaponByName,
} from "@/lib/fate";
import { PixelButton, WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;
const SEEN_KEY = "valo-wseen";

function getSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function WeaponRoulette() {
  const [type, setType] = useState("All");
  const [current, setCurrent] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Seen-guns live in localStorage; hydrate after mount (see pixel.tsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(getSeen());
  }, []);

  const pool = WEAPON_META.filter((w) => type === "All" || w.type === type);
  const left = pool.filter((w) => !seen.includes(w.name));

  function roll() {
    if (spinning) return;
    setSpinning(true);
    setCopied(false);
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      setCurrent(pickRandom(pool).name);
      sfx.tick();
      if (ticks >= 14) {
        window.clearInterval(timer);
        const src = left.length > 0 ? left : pool;
        const pick = pickRandom(src).name;
        setCurrent(pick);
        const next = left.length > 0 ? [...seen, pick] : [pick];
        setSeen(next);
        try {
          window.localStorage.setItem(SEEN_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event("storage"));
        } catch {
          /* play on */
        }
        sfx.lock();
        setSpinning(false);
      }
    }, 70);
  }

  const meta = current ? weaponByName(current) : null;
  const copy = meta ? `LOADOUT: ${meta.name} (${meta.type}, ${meta.price} credits). VALO ROULETTE.` : "";

  return (
    <WindowCard title="WEAPON ROULETTE // GUN GAME" right={spinning ? "ROLLING" : "READY"}>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {["All", ...WEAPON_TYPES].map((t) => (
          <button
            key={t}
            type="button"
            style={PX}
            aria-pressed={type === t}
            onClick={() => {
              setType(t);
              sfx.click();
            }}
            className={`cursor-pointer border-2 px-3 py-2 text-[9px] ${
              type === t
                ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)]"
                : "border-[var(--color-ash)] text-[var(--color-smoke)] hover:text-[var(--color-bone)]"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="scanlines relative flex min-h-56 flex-col items-center justify-center gap-2 overflow-hidden border-2 border-[var(--color-edge)] bg-[var(--color-void)] p-6">
        {meta ? (
          <>
            <p
              style={PX}
              className={`text-3xl sm:text-4xl ${spinning ? "anim-cycling text-[var(--color-blood)]" : "text-[var(--color-bone)]"}`}
            >
              {meta.name.toUpperCase()}
            </p>
            <p className="text-2xl text-[var(--color-smoke)]">
              {meta.type} {"//"} {meta.price} CREDITS
            </p>
          </>
        ) : (
          <p style={PX} className="text-3xl text-[var(--color-edge)]">
            ???
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <PixelButton variant="blood" onClick={roll} className="flex-1">
          {spinning ? "[ ROLLING... ]" : "[ ROLL WEAPON ]"}
        </PixelButton>
        {meta && !spinning && (
          <PixelButton
            variant="ghost"
            className="flex-1 border-2 border-[var(--color-ash)]"
            onClick={() => {
              void navigator.clipboard?.writeText(copy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              });
            }}
          >
            {copied ? "[ COPIED ]" : "[ COPY LOADOUT ]"}
          </PixelButton>
        )}
      </div>
      <p className="mt-3 text-xl text-[var(--color-ash)]">
        {"// Pool: "}
        {left.length}/{pool.length} left in {type === "All" ? "armory" : type}.
      </p>
    </WindowCard>
  );
}

export function ArmoryGrid() {
  const [seen, setSeen] = useState<string[]>([]);
  useEffect(() => {
    // Same localStorage hydration pattern as above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(getSeen());
    const on = () => setSeen(getSeen());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  return (
    <WindowCard title="ARMORY // FULL PRICE LIST" right={`${WEAPON_META.length}`}>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {WEAPON_META.map((w) => {
          const dim = seen.includes(w.name);
          return (
            <li
              key={w.name}
              className={`border-2 p-3 ${
                dim
                  ? "border-[var(--color-edge)] opacity-40"
                  : "border-[var(--color-ash)]"
              }`}
            >
              <p style={PX} className="text-[10px] text-[var(--color-bone)]">
                {w.name.toUpperCase()}
              </p>
              <p className="mt-1 text-xl leading-none text-[var(--color-gold)]">
                {w.type.toUpperCase()}
              </p>
              <p className="text-xl leading-tight text-[var(--color-smoke)]">
                {w.price} CR
              </p>
            </li>
          );
        })}
      </ul>
    </WindowCard>
  );
}
