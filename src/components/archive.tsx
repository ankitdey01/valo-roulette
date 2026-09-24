"use client";

import { useState } from "react";
import { AGENTS, agentPhoto, hasLocalArt, sfx, type Agent } from "@/lib/fate";
import { WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;

function CellArt({ agent }: { agent: Agent }) {
  const [dead, setDead] = useState(false);
  if (hasLocalArt(agent.name) && !dead) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={agentPhoto(agent)}
        alt={`${agent.name} portrait`}
        width={240}
        height={240}
        loading="lazy"
        onError={() => setDead(true)}
        className="px-img aspect-square w-full object-cover"
      />
    );
  }
  return (
    <div className="flex aspect-square w-full items-center justify-center bg-[var(--color-void)]">
      <span style={PX} className="text-4xl text-[var(--color-blood)]">
        {agent.name.charAt(0)}
      </span>
    </div>
  );
}

const ROLES = ["All", "Duelist", "Controller", "Initiator", "Sentinel"] as const;

export function Archive({ agents }: { agents: Agent[] }) {
  const [role, setRole] = useState<(typeof ROLES)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);

  const list = role === "All" ? agents : agents.filter((a) => a.role === role);
  const current = open ? AGENTS.find((a) => a.name === open) ?? null : null;

  return (
    <WindowCard title="AGENT ARCHIVE // CLASSIFIED" right={`${list.length}/29`}>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by role">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            style={PX}
            aria-pressed={role === r}
            onClick={() => {
              setRole(r);
              setOpen(null);
              sfx.click();
            }}
            className={`cursor-pointer border-2 px-3 py-2 text-[9px] ${
              role === r
                ? "border-[var(--color-blood)] bg-[var(--color-blood)] text-[var(--color-bone)]"
                : "border-[var(--color-ash)] text-[var(--color-smoke)] hover:text-[var(--color-bone)]"
            }`}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((a) => (
          <li key={a.name}>
            <button
              type="button"
              onClick={() => {
                setOpen(open === a.name ? null : a.name);
                sfx.click();
              }}
              aria-expanded={open === a.name}
              className={`px-cell block w-full cursor-pointer text-left ${
                open === a.name ? "border-[var(--color-blood)]" : ""
              }`}
            >
              <CellArt agent={a} />
              <span className="block border-t-2 border-[var(--color-edge)] p-2">
                <span style={PX} className="block text-[9px] text-[var(--color-bone)]">
                  {a.name.toUpperCase()}
                </span>
                <span className="mt-1 block text-lg leading-none text-[var(--color-gold)]">
                  {a.role.toUpperCase()}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div className="mt-4 border-2 border-[var(--color-blood)] bg-[var(--color-void)] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p style={PX} className="text-lg text-[var(--color-bone)]">
              {current.name.toUpperCase()}
            </p>
            <p className="text-xl text-[var(--color-gold)]">
              {current.role} {"//"} {current.gender}
            </p>
          </div>
          <p className="mt-2 max-w-3xl text-xl leading-snug text-[var(--color-smoke)]">
            {current.description}
          </p>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {current.abilities.map((ab) => (
              <li key={ab.name} className="border border-[var(--color-edge)] p-3">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xl text-[var(--color-bone)]">{ab.name}</span>
                  <span className="text-lg text-[var(--color-blood)]">[{ab.cost}]</span>
                </p>
                <p className="mt-1 text-lg leading-snug text-[var(--color-smoke)]">
                  {ab.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </WindowCard>
  );
}
