"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sfx, store } from "@/lib/fate";

const PX = { fontFamily: "var(--font-px)" } as const;

/* ------------------------------ buttons ------------------------------- */

export function PixelButton({
  children,
  onClick,
  variant = "bone",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "bone" | "blood" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  const faces =
    variant === "blood"
      ? "bg-[var(--color-blood)] text-[var(--color-bone)]"
      : variant === "ghost"
        ? "bg-transparent text-[var(--color-bone)]"
        : "bg-[var(--color-bone)] text-[var(--color-abyss)]";
  return (
    <button
      type={type}
      onClick={() => {
        sfx.click();
        onClick?.();
      }}
      style={PX}
      className={`px-btn cursor-pointer px-6 py-4 text-xs sm:text-sm ${faces} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------- window card ----------------------------- */

export function WindowCard({
  title,
  right,
  children,
  hot = false,
  className = "",
}: {
  title: string;
  right?: string;
  children: React.ReactNode;
  hot?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`${hot ? "px-frame-hot" : "px-frame"} px-shadow relative ${className}`}
    >
      <header className="px-titlebar flex items-center justify-between gap-2 px-3 py-2">
        <span style={PX} className="text-[10px uppercase tracking-widest">
          <span className="mr-2 inline-block h-2.5 w-2.5 bg-[var(--color-blood)]" />
          {title}
        </span>
        <span className="flex items-center gap-2 text-lg leading-none text-[var(--color-ash)]">
          {right ? <span className="text-[var(--color-gold)]">{right}</span> : null}
          <span aria-hidden>[X]</span>
        </span>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

/* ------------------------------ labels -------------------------------- */

export function HudLabel({ k, v }: { k: string; v: string }) {
  return (
    <p className="text-xl leading-none">
      <span className="text-[var(--color-gold)]">{"//"} {k}: </span>
      <span className="text-[var(--color-bone)]">{v}</span>
    </p>
  );
}

/* --------------------------- pixel divider ---------------------------- */

const STRIP = ["#FF4655", "#7D8082", "#ECE8E1", "#7D8082"] as const;

export function PixelDivider() {
  return (
    <div className="px-strip w-full" aria-hidden>
      {Array.from({ length: 96 }).map((_, i) => (
        <span
          key={i}
          className="h-2 flex-1"
          style={{ background: STRIP[i % STRIP.length] }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ marquee ------------------------------- */

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-[var(--color-ash)] bg-[var(--color-blood)]">
      <div className="anim-marquee flex w-max items-center gap-6 py-2 pr-6">
        {row.map((t, i) => (
          <span
            key={i}
            style={PX}
            className="flex items-center gap-6 text-[11px] whitespace-nowrap text-[var(--color-bone)]"
          >
            {t} <span aria-hidden>{"■"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- telemetry ------------------------------ */

export function TelemetryStrip() {
  const [snap, setSnap] = useState({
    total: 0,
    streak: 0,
    left: 29,
    top: "—",
  });

  const refresh = useCallback(() => {
    const seen = store.getSeen();
    setSnap({
      total: store.totalRolls(),
      streak: store.getStreak(),
      left: 29 - seen.length,
      top: store.mostRolled() ?? "—",
    });
  }, []);

  useEffect(() => {
    // Hydrate from localStorage after mount: page is statically prerendered,
    // so client storage values must load post-hydration to avoid mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    window.addEventListener("valo:update", refresh);
    return () => window.removeEventListener("valo:update", refresh);
  }, [refresh]);

  const cells: Array<[string, string]> = [
    ["TOTAL ROLLS", String(snap.total)],
    ["LOCK-IN STREAK", String(snap.streak).padStart(2, "0")],
    ["POOL LEFT", `${snap.left}/29`],
    ["MOST ROLLED", snap.top.toUpperCase()],
  ];

  return (
    <div className="grid grid-cols-2 border-2 border-[var(--color-ash)] bg-[var(--color-void)] lg:grid-cols-4">
      {cells.map(([k, v], i) => (
        <div
          key={k}
          className={`px-4 py-3 ${i > 0 ? "border-l border-[var(--color-edge)]" : ""} ${i >= 2 ? "max-lg:border-t max-lg:border-[var(--color-edge)]" : ""} ${i === 2 ? "max-lg:border-l-0" : ""}`}
        >
          <p style={PX} className="text-[9px] text-[var(--color-gold)]">
            {k}
          </p>
          <p style={PX} className="mt-2 text-sm text-[var(--color-bone)]">
            {v}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- nav --------------------------------- */

export function HudNav() {
  const [on, setOn] = useState(true);
  const path = usePathname();

  useEffect(() => {
    // SFX preference lives in localStorage; read after mount (see above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(store.getSfx());
  }, []);

  const links: Array<[string, string]> = [
    ["ROLL", "/"],
    ["CHAOS", "/chaos"],
    ["GUNS", "/weapons"],
    ["AGENTS", "/agents"],
    ["DAILY", "/daily"],
    ["CHALLENGE RUN", "/challenge-run"],
    ["CHALLENGE ROOM", "/challenge-room"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-ash)] bg-[var(--color-void)]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-block h-4 w-4 bg-[var(--color-blood)]" aria-hidden />
          <span style={PX} className="text-xs text-[var(--color-bone)]">
            VALO<span className="text-[var(--color-blood)]">{"//"}</span>ROULETTE
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xl" aria-label="Sections">
          {links.map(([label, href]) => {
            const here = path === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={here ? "page" : undefined}
                className={
                  here
                    ? "text-[var(--color-blood)]"
                    : "text-[var(--color-smoke)] hover:text-[var(--color-bone)]"
                }
              >
                [{label}]
              </a>
            );
          })}
        </nav>
        <button
          type="button"
          style={PX}
          onClick={() => {
            const next = !on;
            setOn(next);
            store.setSfx(next);
            sfx.toggle();
          }}
          className="cursor-pointer border-2 border-[var(--color-ash)] px-3 py-2 text-[10px] text-[var(--color-bone)] hover:border-[var(--color-blood)]"
          aria-pressed={on}
        >
          SFX {on ? "ON" : "OFF"}
        </button>
      </div>
    </header>
  );
}
