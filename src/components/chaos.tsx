"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AGENTS,
  CHALLENGES,
  MAPS,
  MODIFIERS,
  WEAPONS,
  agentPhoto,
  pickRandom,
  shuffle,
  sfx,
} from "@/lib/fate";
import { newRunId, runs } from "@/lib/runs";
import { PixelButton, WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;

type Tier = "NORMAL" | "CHAOS" | "NIGHTMARE" | "STUPID";

type ChaosResult = {
  agent: string;
  role: string;
  map?: string;
  sites?: string;
  weapon?: string;
  challenge?: string;
  modifier?: string;
};

function buildChaos(tier: Tier): ChaosResult {
  const a = pickRandom(AGENTS);
  const m = pickRandom(MAPS);
  const base: ChaosResult = { agent: a.name, role: a.role };
  if (tier === "NORMAL") return base;
  base.map = m.name;
  base.sites = m.sites.join(" / ");
  if (tier === "CHAOS") return base;
  base.weapon = pickRandom([...WEAPONS]);
  if (tier === "NIGHTMARE") return base;
  base.challenge = pickRandom([...CHALLENGES]);
  base.modifier = pickRandom([...MODIFIERS]);
  return base;
}

function ChaosTab() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("CHAOS");
  const [res, setRes] = useState<ChaosResult | null>(null);
  const [copied, setCopied] = useState(false);

  const tiers: Array<[Tier, string]> = [
    ["NORMAL", "AGENT"],
    ["CHAOS", "+MAP"],
    ["NIGHTMARE", "+WEAPON"],
    ["STUPID", "+ALL"],
  ];

  function generate() {
    setRes(buildChaos(tier));
    setCopied(false);
  }

  function sendToShowcase() {
    if (!res) return;
    runs.setActive({
      id: newRunId(),
      agent: res.agent,
      role: res.role,
      weapon: res.weapon ?? pickRandom([...WEAPONS]),
      challenge: res.challenge ?? pickRandom([...CHALLENGES]),
      modifier: res.modifier ?? pickRandom([...MODIFIERS]),
      status: "active",
      startedAt: Date.now(),
      finishedAt: null,
    });
    router.push("/challenge-run");
  }

  const copy = `VALORANT CHALLENGE:\n${res ? `${res.agent} (${res.role})${res.map ? ` + ${res.map} [${res.sites}]` : ""}${res.weapon ? ` // ${res.weapon} only` : ""}${res.challenge ? `\nMission: ${res.challenge}` : ""}${res.modifier ? `\nModifier: ${res.modifier}` : ""}` : ""}\nWish me luck.`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Chaos tier">
        {tiers.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTier(t);
              sfx.click();
            }}
            style={PX}
            aria-pressed={tier === t}
            className={`cursor-pointer border-2 px-2 py-3 text-[9px] ${
              tier === t
                ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)]"
                : "border-[var(--color-ash)] text-[var(--color-smoke)] hover:text-[var(--color-bone)]"
            }`}
          >
            {t}
            <br />
            <span className="text-[8px] opacity-80">{label}</span>
          </button>
        ))}
      </div>

      <PixelButton variant="blood" onClick={generate} className="w-full">
        [ GENERATE CHAOS ]
      </PixelButton>

      {res ? (
        <div className="scanlines relative border-2 border-[var(--color-blood)] bg-[var(--color-void)] p-4">
          <p style={PX} className="text-[9px] text-[var(--color-gold)]">
            CHAOS MODE // {tier}
          </p>
          <dl className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={agentPhoto(AGENTS.find((a) => a.name === res.agent)!)}
                alt=""
                width={56}
                height={56}
                className="px-img border-2 border-[var(--color-ash)] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <dt style={PX} className="text-[9px] text-[var(--color-ash)]">AGENT</dt>
                <dd style={PX} className="text-sm text-[var(--color-bone)]">
                  {res.agent.toUpperCase()} <span className="text-[var(--color-ash)]">[{res.role}]</span>
                </dd>
              </div>
            </div>
            {res.map && (
              <div>
                <dt style={PX} className="text-[9px] text-[var(--color-ash)]">MAP</dt>
                <dd style={PX} className="text-sm text-[var(--color-bone)]">
                  {res.map.toUpperCase()} <span className="text-[var(--color-gold)]">[{res.sites}]</span>
                </dd>
              </div>
            )}
            {res.weapon && (
              <div>
                <dt style={PX} className="text-[9px] text-[var(--color-ash)]">WEAPON</dt>
                <dd style={PX} className="text-sm text-[var(--color-bone)]">
                  {res.weapon.toUpperCase()} ONLY
                </dd>
              </div>
            )}
            {res.challenge && (
              <div>
                <dt style={PX} className="text-[9px] text-[var(--color-ash)]">CHALLENGE</dt>
                <dd className="text-2xl text-[var(--color-bone)]">{res.challenge}</dd>
              </div>
            )}
            {res.modifier && (
              <div>
                <dt style={PX} className="text-[9px] text-[var(--color-ash)]">MODIFIER</dt>
                <dd className="text-2xl text-[var(--color-blood)]">{res.modifier}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
              {copied ? "[ COPIED ]" : "[ ACCEPT YOUR FATE ]"}
            </PixelButton>
            <PixelButton variant="blood" className="flex-1" onClick={sendToShowcase}>
              [ START THIS RUN ]
            </PixelButton>
          </div>
        </div>
      ) : (
        <p className="border-2 border-dashed border-[var(--color-edge)] p-4 text-xl text-[var(--color-ash)]">
          {"// Pick a tier. Generate."}
        </p>
      )}
    </div>
  );
}

function StackTab() {
  const [names, setNames] = useState(["PLAYER-1", "PLAYER-2", "PLAYER-3", "PLAYER-4", "PLAYER-5"]);
  const [team, setTeam] = useState<Array<{ player: string; agent: string; role: string }> | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    const agents = shuffle(AGENTS).slice(0, 5);
    setTeam(
      names.map((n, i) => ({
        player: n.trim() === "" ? `P${i + 1}` : n.trim().toUpperCase().slice(0, 12),
        agent: agents[i].name,
        role: agents[i].role,
      })),
    );
    setCopied(false);
  }

  const duelists = team?.filter((t) => t.role === "Duelist").length ?? 0;
  const controllers = team?.filter((t) => t.role === "Controller").length ?? 0;
  const initiators = team?.filter((t) => t.role === "Initiator").length ?? 0;
  const sentinels = team?.filter((t) => t.role === "Sentinel").length ?? 0;
  const verdict = !team
    ? ""
    : duelists >= 4
      ? "Nobody remembered to buy smokes."
      : duelists === 0
        ? "Zero duelists. Everyone entry... nobody."
      : controllers === 0
        ? "Vision has been legally removed."
        : sentinels >= 4
          ? "The site is now a fortress."
          : "TEAM BALANCE: Questionable. BLAME CHANCE: 100%.";

  const copy = team
    ? `WE LET FATE BUILD OUR TEAM:\n${team.map((t) => `${t.player} -> ${t.agent} [${t.role}]`).join("\n")}\n${verdict}`
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {names.map((n, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span style={PX} className="text-[8px] text-[var(--color-gold)]">P{i + 1}</span>
            <input
              value={n}
              maxLength={12}
              onChange={(e) =>
                setNames((ns) => ns.map((x, j) => (j === i ? e.target.value : x)))
              }
              className="w-full border-2 border-[var(--color-ash)] bg-[var(--color-void)] px-2 py-2 text-xl text-[var(--color-bone)] uppercase outline-none placeholder:text-[var(--color-edge)] focus:border-[var(--color-blood)]"
              placeholder={`P${i + 1}`}
            />
          </label>
        ))}
      </div>
      <PixelButton variant="blood" onClick={generate} className="w-full">
        [ DRAFT THE 5-STACK ]
      </PixelButton>
      {team ? (
        <div className="border-2 border-[var(--color-ash)] bg-[var(--color-void)]">
          <p style={PX} className="border-b-2 border-[var(--color-ash)] px-4 py-2 text-[9px] text-[var(--color-gold)]">
            YOUR TEAM HAS BEEN CHOSEN
          </p>
          <ul>
            {team.map((t, i) => (
              <li
                key={`${t.player}-${i}`}
                className="flex items-center justify-between gap-2 border-b border-[var(--color-edge)] px-4 py-2 last:border-0"
              >
                <span className="text-xl text-[var(--color-smoke)]">{t.player}</span>
                <span className="text-xl text-[var(--color-ash)]">{"->"}</span>
                <span className="text-right">
                  <span style={PX} className="block text-[10px] text-[var(--color-bone)]">
                    {t.agent.toUpperCase()}
                  </span>
                  <span className="mt-0.5 block text-lg leading-none text-[var(--color-gold)]">
                    [{t.role.toUpperCase()}]
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-[var(--color-edge)] px-4 py-2 text-xl text-[var(--color-gold)]">
            {"// COMP // D:"}{duelists} C:{controllers} I:{initiators} S:
            {sentinels}
          </p>
          <p className="border-t-2 border-[var(--color-blood)] px-4 py-3 text-2xl text-[var(--color-bone)]">
            {verdict}
          </p>
          <div className="p-4 pt-0">
            <PixelButton
              variant="ghost"
              className="w-full border-2 border-[var(--color-ash)]"
              onClick={() => {
                void navigator.clipboard?.writeText(copy).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                });
              }}
            >
              {copied ? "[ COPIED ]" : "[ SHARE TEAM ]"}
            </PixelButton>
          </div>
        </div>
      ) : (
        <p className="border-2 border-dashed border-[var(--color-edge)] p-4 text-xl text-[var(--color-ash)]">
          {"// Five names in. Five fates out."}
        </p>
      )}
    </div>
  );
}

export function ChaosChamber() {
  const [tab, setTab] = useState<"chaos" | "stack">("chaos");
  return (
    <WindowCard title="CHAOS TERMINAL // PARTY PROTOCOLS" right={tab === "chaos" ? "CHAOS" : "5-STACK"}>
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Party modes">
        {(
          [
            ["chaos", "CHAOS MODE"],
            ["stack", "5-STACK"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            style={PX}
            onClick={() => {
              setTab(t);
              sfx.click();
            }}
            className={`cursor-pointer border-2 px-4 py-3 text-[10px] ${
              tab === t
                ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)]"
                : "border-[var(--color-ash)] text-[var(--color-smoke)] hover:text-[var(--color-bone)]"
            }`}
          >
            [{label}]
          </button>
        ))}
      </div>
      {tab === "chaos" ? <ChaosTab /> : <StackTab />}
    </WindowCard>
  );
}
