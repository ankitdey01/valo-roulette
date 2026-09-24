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
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "bone" | "blood" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
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
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        sfx.click();
        onClick?.(e);
      }}
      style={PX}
      className={`px-btn touch-manipulation cursor-pointer px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm ${faces} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    // SFX preference lives in localStorage; read after mount (see above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(store.getSfx());
  }, []);

  useEffect(() => {
    // Close menu on route change
    setMenuOpen(false);
  }, [path]);

  const links: Array<[string, string]> = [
    ["ROLL", "/"],
    ["CHAOS", "/chaos"],
    ["CHALLENGE", "/challenge-run"],
    ["AGENTS", "/agents"],
    ["WEAPONS", "/weapons"],
    ["DAILY", "/daily"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-ash)] bg-[var(--color-void)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        {/* Mobile Header */}
        <div className="flex items-center justify-between sm:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 bg-[var(--color-blood)]" aria-hidden />
            <span style={PX} className="text-[10px] text-[var(--color-bone)]">
              VALO<span className="text-[var(--color-blood)]">{"//"}</span>ROULETTE
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={PX}
              onClick={(e) => {
                e.stopPropagation();
                const next = !on;
                setOn(next);
                store.setSfx(next);
                sfx.toggle();
              }}
              className="touch-manipulation cursor-pointer border-2 border-[var(--color-ash)] bg-[var(--color-void)] px-2 py-1.5 text-[8px] text-[var(--color-bone)] active:bg-[var(--color-ash)]"
              aria-pressed={on}
            >
              SFX {on ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="touch-manipulation cursor-pointer border-2 border-[var(--color-ash)] bg-[var(--color-void)] px-2.5 py-1 text-lg leading-none text-[var(--color-bone)] active:bg-[var(--color-ash)]"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="mt-3 flex flex-col gap-1 border-t-2 border-[var(--color-edge)] pt-3 sm:hidden">
            {links.map(([label, href]) => {
              const here = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`touch-manipulation block border-2 px-3 py-2.5 text-base ${
                    here
                      ? "border-[var(--color-blood)] bg-[var(--color-void)] text-[var(--color-blood)]"
                      : "border-[var(--color-edge)] bg-[var(--color-void)] text-[var(--color-smoke)] active:bg-[var(--color-edge)]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  [{label}]
                </Link>
              );
            })}
          </nav>
        )}

        {/* Desktop Header */}
        <div className="hidden items-center justify-between sm:flex">
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
                <Link
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
                </Link>
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
      </div>
    </header>
  );
}
