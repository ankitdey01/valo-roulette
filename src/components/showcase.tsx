"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hasLocalArt, sfx, type Agent } from "@/lib/fate";
import {
  SITE_URL,
  CHALLENGE_RUN_URL,
  rollChallenge,
  runCaption,
  runs,
  shareLinks,
  type ChallengeRun,
  type RunStatus,
} from "@/lib/runs";
import { HudLabel, PixelButton, WindowCard } from "@/components/pixel";

const PX = { fontFamily: "var(--font-px)" } as const;
export const DAILY_URL = `${SITE_URL}/daily`;

/* ------------------------- pixel banner painter ------------------------ */

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur === "" ? w : `${cur} ${w}`;
    if (ctx.measureText(test).width > maxWidth && cur !== "") {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function paintBanner(run: ChallengeRun): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  try {
    await Promise.all([
      document.fonts.load('54px "Press Start 2P"'),
      document.fonts.load('48px "VT323"'),
    ]);
  } catch {
    /* fall back to monospace */
  }

  const PXF = (px: number) => `${px}px "Press Start 2P", monospace`;
  const HUDF = (px: number) => `${px}px "VT323", monospace`;

  // bg + dot grid
  ctx.fillStyle = "#0F1923";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1d2a3a";
  for (let y = 24; y < H; y += 44) {
    for (let x = 24; x < W; x += 44) {
      ctx.fillRect(x, y, 5, 5);
    }
  }

  // frames
  ctx.strokeStyle = "#FF4655";
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = "#7D8082";
  ctx.lineWidth = 3;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  let y = 170;
  ctx.textAlign = "center";

  ctx.fillStyle = "#FFD694";
  ctx.font = PXF(30);
  ctx.fillText("VALO ROULETTE", W / 2, y);
  y += 70;

  const cleared = run.status === "cleared";
  const active = run.status === "active";
  ctx.fillStyle = active ? "#ECE8E1" : cleared ? "#FF4655" : "#7D8082";
  ctx.font = PXF(44);
  ctx.fillText(
    active ? "CHALLENGE ACCEPTED" : cleared ? "FATE CLEARED" : "FATE FAILED",
    W / 2,
    y,
  );
  y += 40;

  // agent art
  const ART = 520;
  const ax = (W - ART) / 2;
  const ay = y;
  ctx.fillStyle = "#070B12";
  ctx.fillRect(ax, ay, ART, ART);
  const key = run.agent.toLowerCase().replace("/", "-");
  if (hasLocalArt(run.agent)) {
    try {
      const img = await loadImage(`/agents/${key}.jpg`);
      // cover-fit crop
      const s = Math.min(img.width / ART, img.height / ART);
      const sw = ART * s;
      const sh = ART * s;
      ctx.drawImage(
        img,
        (img.width - sw) / 2,
        (img.height - sh) / 2,
        sw,
        sh,
        ax,
        ay,
        ART,
        ART,
      );
    } catch {
      ctx.fillStyle = "#FF4655";
      ctx.font = PXF(200);
      ctx.fillText(run.agent.charAt(0), W / 2, ay + 350);
    }
  } else {
    ctx.fillStyle = "#FF4655";
    ctx.font = PXF(200);
    ctx.fillText(run.agent.charAt(0), W / 2, ay + 350);
  }
  ctx.strokeStyle = "#FF4655";
  ctx.lineWidth = 8;
  ctx.strokeRect(ax, ay, ART, ART);
  y = ay + ART + 90;

  ctx.fillStyle = "#ECE8E1";
  ctx.font = PXF(64);
  const nameLines = wrapText(ctx, run.agent.toUpperCase(), W - 200);
  for (const ln of nameLines.slice(0, 2)) {
    ctx.fillText(ln, W / 2, y);
    y += 80;
  }

  ctx.font = HUDF(52);
  ctx.fillStyle = "#B9BFC6";
  ctx.fillText(run.role.toUpperCase(), W / 2, y);
  y += 62;
  ctx.fillStyle = "#ECE8E1";
  ctx.fillText(`${run.weapon} ONLY`, W / 2, y);
  y += 70;

  ctx.font = HUDF(50);
  ctx.fillStyle = "#FFD694";
  for (const ln of wrapText(ctx, `Mission: ${run.challenge}`, W - 200).slice(0, 2)) {
    ctx.fillText(ln, W / 2, y);
    y += 56;
  }
  ctx.fillStyle = "#FF4655";
  for (const ln of wrapText(ctx, run.modifier, W - 200).slice(0, 2)) {
    ctx.fillText(ln, W / 2, y);
    y += 56;
  }

  ctx.fillStyle = "#FFD694";
  ctx.font = PXF(22);
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), W / 2, H - 160);
  ctx.fillStyle = "#7D8082";
  ctx.font = PXF(22);
  ctx.fillText("NO REROLLS /// DON'T BLAME US", W / 2, H - 110);

  return cv;
}

export async function paintDailyCard(
  agent: Agent,
  challenge: string,
  label: string,
): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  try {
    await Promise.all([
      document.fonts.load('54px "Press Start 2P"'),
      document.fonts.load('48px "VT323"'),
    ]);
  } catch {
    /* fall back to monospace */
  }

  const PXF = (px: number) => `${px}px "Press Start 2P", monospace`;
  const HUDF = (px: number) => `${px}px "VT323", monospace`;

  ctx.fillStyle = "#0F1923";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1d2a3a";
  for (let y = 24; y < H; y += 44) {
    for (let x = 24; x < W; x += 44) {
      ctx.fillRect(x, y, 5, 5);
    }
  }

  ctx.strokeStyle = "#FFD694";
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = "#7D8082";
  ctx.lineWidth = 3;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  let y = 170;
  ctx.textAlign = "center";

  ctx.fillStyle = "#FFD694";
  ctx.font = PXF(30);
  ctx.fillText("VALO ROULETTE", W / 2, y);
  y += 70;

  ctx.fillStyle = "#ECE8E1";
  ctx.font = PXF(44);
  ctx.fillText("DAILY DROP", W / 2, y);
  y += 44;

  ctx.fillStyle = "#7D8082";
  ctx.font = PXF(24);
  ctx.fillText(label.toUpperCase(), W / 2, y);
  y += 36;

  const ART = 520;
  const ax = (W - ART) / 2;
  ctx.fillStyle = "#070B12";
  ctx.fillRect(ax, y, ART, ART);
  const key = agent.name.toLowerCase().replace("/", "-");
  if (hasLocalArt(agent.name)) {
    try {
      const img = await loadImage(`/agents/${key}.jpg`);
      const s = Math.min(img.width / ART, img.height / ART);
      const sw = ART * s;
      const sh = ART * s;
      ctx.drawImage(
        img,
        (img.width - sw) / 2,
        (img.height - sh) / 2,
        sw,
        sh,
        ax,
        y,
        ART,
        ART,
      );
    } catch {
      ctx.fillStyle = "#FF4655";
      ctx.font = PXF(200);
      ctx.fillText(agent.name.charAt(0), W / 2, y + 350);
    }
  } else {
    ctx.fillStyle = "#FF4655";
    ctx.font = PXF(200);
    ctx.fillText(agent.name.charAt(0), W / 2, y + 350);
  }
  ctx.strokeStyle = "#FFD694";
  ctx.lineWidth = 8;
  ctx.strokeRect(ax, y, ART, ART);
  y += ART + 90;

  ctx.fillStyle = "#ECE8E1";
  ctx.font = PXF(64);
  const nameLines = wrapText(ctx, agent.name.toUpperCase(), W - 200);
  for (const ln of nameLines.slice(0, 2)) {
    ctx.fillText(ln, W / 2, y);
    y += 80;
  }

  ctx.font = HUDF(52);
  ctx.fillStyle = "#B9BFC6";
  ctx.fillText(agent.role.toUpperCase(), W / 2, y);
  y += 70;

  ctx.fillStyle = "#ECE8E1";
  for (const ln of wrapText(ctx, `Today: ${challenge}`, W - 200).slice(0, 3)) {
    ctx.fillText(ln, W / 2, y);
    y += 58;
  }

  ctx.fillStyle = "#FFD694";
  ctx.font = PXF(22);
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), W / 2, H - 160);
  ctx.fillStyle = "#7D8082";
  ctx.font = PXF(22);
  ctx.fillText("COME BACK TOMORROW", W / 2, H - 110);

  return cv;
}

function canvasToBlob(cv: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png");
  });
}

/* ------------------------------ share row ----------------------------- */

export function CardShare({
  caption,
  filename,
  paint,
  pageUrl,
}: {
  caption: string;
  filename: string;
  paint: () => Promise<HTMLCanvasElement>;
  pageUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const links = shareLinks(caption, pageUrl);
  const canNative =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  async function download() {
    setBusy(true);
    try {
      const cv = await paint();
      const blob = await canvasToBlob(cv);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      setBusy(false);
    }
  }

  async function nativeShare() {
    try {
      const cv = await paint();
      const blob = await canvasToBlob(cv);
      const file = new File([blob], filename, {
        type: "image/png",
      });
      const data: ShareData = { title: "VALO ROULETTE", text: caption };
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        data.files = [file];
      }
      await navigator.share(data);
    } catch {
      /* dismissed */
    }
  }

  const btn =
    "flex-1 cursor-pointer border-2 border-[var(--color-ash)] px-2 py-3 text-center text-[10px] text-[var(--color-bone)] hover:border-[var(--color-blood)]";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2" style={PX}>
        <a className={btn} href={links.x} target="_blank" rel="noopener noreferrer">
          [X]
        </a>
        <a className={btn} href={links.whatsapp} target="_blank" rel="noopener noreferrer">
          [WA]
        </a>
        <a className={btn} href={links.telegram} target="_blank" rel="noopener noreferrer">
          [TG]
        </a>
        <button
          type="button"
          className={btn}
          style={PX}
          onClick={() => {
            void navigator.clipboard?.writeText(caption).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "[OK]" : "[COPY]"}
        </button>
      </div>
      <div className="flex gap-2" style={PX}>
        <button type="button" className={btn} style={PX} onClick={download} disabled={busy}>
          {busy ? "[...]" : "[SAVE PNG]"}
        </button>
        {canNative && (
          <button type="button" className={btn} style={PX} onClick={nativeShare}>
            [SHARE]
          </button>
        )}
      </div>
      <p className="text-lg text-[var(--color-ash)]">
        {"// Text posts to X/WA/TG. PNG for Instagram."}
      </p>
    </div>
  );
}

export function ShareRow({ run }: { run: ChallengeRun }) {
  return (
    <CardShare
      caption={runCaption(run)}
      filename={`valo-roulette-${run.id.toLowerCase()}.png`}
      paint={() => paintBanner(run)}
      pageUrl={CHALLENGE_RUN_URL}
    />
  );
}

/* ---------------------------- banner preview --------------------------- */

function BannerPreview({ run }: { run: ChallengeRun }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let live = true;
    paintBanner(run)
      .then((cv) => {
        if (!live || !ref.current) return;
        const dst = ref.current;
        dst.width = cv.width;
        dst.height = cv.height;
        dst.getContext("2d")?.drawImage(cv, 0, 0);
      })
      .catch(() => {
        /* paint failed, DOM fallback below still shows */
      });
    return () => {
      live = false;
    };
  }, [run]);

  return (
    <canvas
      ref={ref}
      className="px-img w-full border-2 border-[var(--color-ash)]"
      aria-label={`Showcase banner for ${run.agent}`}
    />
  );
}

/* ------------------------------ the board ------------------------------ */

export function ShowcaseBoard() {
  const router = useRouter();
  const [active, setActive] = useState<ChallengeRun | null>(null);
  const [history, setHistory] = useState<ChallengeRun[]>([]);

  const refresh = useCallback(() => {
    setActive(runs.getActive());
    setHistory(runs.getHistory());
  }, []);

  useEffect(() => {
    // Hydrate runs from localStorage after mount (statically prerendered page).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    window.addEventListener("valo:runs", refresh);
    return () => window.removeEventListener("valo:runs", refresh);
  }, [refresh]);

  function startNew(agentName?: string) {
    const run = rollChallenge(agentName);
    runs.setActive(run);
    sfx.lock();
    refresh();
  }

  function finish(status: "cleared" | "failed") {
    if (!active) return;
    runs.finish(active, status);
    sfx.lock();
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {active ? (
        <WindowCard title={`ACTIVE RUN // ${active.id}`} right="LIVE" hot>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <HudLabel k="AGENT" v={`${active.agent} [${active.role}]`} />
              <HudLabel k="WEAPON" v={`${active.weapon} ONLY`} />
              <HudLabel k="MISSION" v={active.challenge} />
              <HudLabel k="MOD" v={active.modifier} />
              <p className="mt-2 text-2xl text-[var(--color-smoke)]">
                Play it. Stamp it. No lying.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <PixelButton variant="blood" className="flex-1" onClick={() => finish("cleared")}>
                  [ MARK CLEARED ]
                </PixelButton>
                <PixelButton className="flex-1" onClick={() => finish("failed")}>
                  [ MARK FAILED ]
                </PixelButton>
              </div>
              <button
                type="button"
                onClick={() => {
                  runs.setActive(null);
                  refresh();
                }}
                className="cursor-pointer text-left text-xl text-[var(--color-ash)] hover:text-[var(--color-blood)]"
              >
                {"[ abandon run ]"}
              </button>
            </div>
            <div>
              <BannerPreview run={active} />
              <div className="mt-3">
                <ShareRow run={active} />
              </div>
            </div>
          </div>
        </WindowCard>
      ) : (
        <WindowCard title="CHALLENGE BOARD // NO ACTIVE RUN" right="IDLE">
          <p className="max-w-2xl text-2xl text-[var(--color-smoke)]">
            Roll a loadout. Play it. Stamp it. Flex it.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <PixelButton variant="blood" onClick={() => startNew()}>
              [ START NEW CHALLENGE ]
            </PixelButton>
            <PixelButton onClick={() => router.push("/chaos")}>
              [ BUILD IN CHAOS ]
            </PixelButton>
          </div>
        </WindowCard>
      )}

      {history.length > 0 && (
        <WindowCard title="HALL OF FATE // STAMPED RUNS" right={`${history.length}`}>
          <ul className="grid gap-4 md:grid-cols-2">
            {history.map((run) => (
              <li key={run.id} className="border-2 border-[var(--color-edge)] bg-[var(--color-void)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p style={PX} className="text-[10px] text-[var(--color-bone)]">
                    {run.agent.toUpperCase()}
                  </p>
                  <p
                    style={PX}
                    className={`px-2 py-1 text-[9px] ${
                      run.status === "cleared"
                        ? "bg-[var(--color-blood)] text-[var(--color-bone)]"
                        : "bg-[var(--color-ash)] text-[var(--color-void)]"
                    }`}
                  >
                    {run.status.toUpperCase()}
                  </p>
                </div>
                <p className="mt-2 text-xl text-[var(--color-smoke)]">
                  {run.weapon} ONLY {"//"} {run.challenge}
                </p>
                <div className="mt-3">
                  <ShareRow run={run} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    runs.remove(run.id);
                    refresh();
                  }}
                  className="mt-2 cursor-pointer text-lg text-[var(--color-ash)] hover:text-[var(--color-blood)]"
                >
                  {"[ delete ]"}
                </button>
              </li>
            ))}
          </ul>
        </WindowCard>
      )}
    </div>
  );
}

/* ----------------------------- showcase gallery ------------------------ */

export function ShowcaseGallery() {
  const [history, setHistory] = useState<ChallengeRun[]>([]);
  const [filterAgent, setFilterAgent] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<RunStatus | "ALL">("ALL");
  const [filterWeapon, setFilterWeapon] = useState<string>("ALL");

  const refresh = useCallback(() => {
    setHistory(runs.getHistory());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    window.addEventListener("valo:runs", refresh);
    return () => window.removeEventListener("valo:runs", refresh);
  }, [refresh]);

  const agents = ["ALL", ...[...new Set(history.map((r) => r.agent))].sort()];
  const weapons = ["ALL", ...[...new Set(history.map((r) => r.weapon))].sort()];

  const filtered = history.filter((r) => {
    if (filterAgent !== "ALL" && r.agent !== filterAgent) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (filterWeapon !== "ALL" && r.weapon !== filterWeapon) return false;
    return true;
  });

  const clearedCount = history.filter((r) => r.status === "cleared").length;
  const failedCount = history.filter((r) => r.status === "failed").length;

  return (
    <div className="flex flex-col gap-6">
      <WindowCard title="FILTERS" right={`${filtered.length}/${history.length}`}>
        <div className="grid gap-3 sm:grid-cols-4">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-4 py-3 text-lg border-2 border-[var(--color-ash)] bg-[var(--color-void)] text-[var(--color-bone)] focus:border-[var(--color-blood)]"
            style={PX}
          >
            {agents.map((a) => (
              <option key={a} value={a}>
                {a === "ALL" ? "ALL AGENTS" : a.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RunStatus | "ALL")}
            className="px-4 py-3 text-lg border-2 border-[var(--color-ash)] bg-[var(--color-void)] text-[var(--color-bone)] focus:border-[var(--color-blood)]"
            style={PX}
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="cleared">CLEARED</option>
            <option value="failed">FAILED</option>
          </select>
          <select
            value={filterWeapon}
            onChange={(e) => setFilterWeapon(e.target.value)}
            className="px-4 py-3 text-lg border-2 border-[var(--color-ash)] bg-[var(--color-void)] text-[var(--color-bone)] focus:border-[var(--color-blood)]"
            style={PX}
          >
            {weapons.map((w) => (
              <option key={w} value={w}>
                {w === "ALL" ? "ALL WEAPONS" : w.toUpperCase()}
              </option>
            ))}
          </select>
          <PixelButton variant="ghost" onClick={() => { setFilterAgent("ALL"); setFilterStatus("ALL"); setFilterWeapon("ALL"); }}>
            [ RESET ]
          </PixelButton>
        </div>
      </WindowCard>

      {history.length === 0 ? (
        <WindowCard title="HALL OF FATE // EMPTY" right="0">
          <p className="text-2xl text-[var(--color-smoke)] text-center py-12">
            No runs yet. Start one in CHALLENGE RUN.
          </p>
        </WindowCard>
      ) : (
        <WindowCard
          title="HALL OF FATE // STAMPED RUNS"
          right={`CLEARED ${clearedCount} / FAILED ${failedCount}`}
        >
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((run) => (
              <li key={run.id} className="border-2 border-[var(--color-edge)] bg-[var(--color-void)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p style={PX} className="text-[10px] text-[var(--color-bone)]">
                    {run.agent.toUpperCase()}
                  </p>
                  <p
                    style={PX}
                    className={`px-2 py-1 text-[9px] ${
                      run.status === "cleared"
                        ? "bg-[var(--color-blood)] text-[var(--color-bone)]"
                        : "bg-[var(--color-ash)] text-[var(--color-void)]"
                    }`}
                  >
                    {run.status.toUpperCase()}
                  </p>
                </div>
                <p className="mt-2 text-xl text-[var(--color-smoke)]">
                  {run.weapon} ONLY
                </p>
                <p className="mt-1 text-lg text-[var(--color-ash)]">
                  {run.challenge}
                </p>
                <p className="mt-1 text-sm text-[var(--color-edge)]">
                  {run.modifier}
                </p>
                <div className="mt-3">
                  <ShareRow run={run} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    runs.remove(run.id);
                    refresh();
                  }}
                  className="mt-2 cursor-pointer text-lg text-[var(--color-ash)] hover:text-[var(--color-blood)]"
                >
                  {"[ delete ]"}
                </button>
              </li>
            ))}
          </ul>
        </WindowCard>
      )}
    </div>
  );
}
