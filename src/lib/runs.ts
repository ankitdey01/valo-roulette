import {
  AGENTS,
  CHALLENGES,
  MODIFIERS,
  WEAPONS,
  pickRandom,
} from "@/lib/fate";
import config from "@/data/config.json";

export const SITE_URL = config.siteUrl.replace(/\/$/, "");

/* ------------------------------ run model ----------------------------- */

export type RunStatus = "active" | "cleared" | "failed";

export type ChallengeRun = {
  id: string;
  agent: string;
  role: string;
  weapon: string;
  challenge: string;
  modifier: string;
  status: RunStatus;
  startedAt: number;
  finishedAt: number | null;
};

export function newRunId(): string {
  return `RUN-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 1296,
  )
    .toString(36)
    .toUpperCase()
    .padStart(2, "0")}`;
}

export function rollChallenge(agentName?: string): ChallengeRun {
  const a = agentName
    ? (AGENTS.find((x) => x.name === agentName) ?? pickRandom(AGENTS))
    : pickRandom(AGENTS);
  return {
    id: newRunId(),
    agent: a.name,
    role: a.role,
    weapon: pickRandom([...WEAPONS]),
    challenge: pickRandom([...CHALLENGES]),
    modifier: pickRandom([...MODIFIERS]),
    status: "active",
    startedAt: Date.now(),
    finishedAt: null,
  };
}

/* ------------------------------- storage ------------------------------ */

const ACTIVE_KEY = "valo-active-run";
const HISTORY_KEY = "valo-run-history";
const MAX_HISTORY = 24;

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* play on */
  }
  try {
    window.dispatchEvent(new Event("valo:runs"));
  } catch {
    /* noop */
  }
}

export const runs = {
  getActive(): ChallengeRun | null {
    try {
      const raw = read(ACTIVE_KEY);
      return raw ? (JSON.parse(raw) as ChallengeRun) : null;
    } catch {
      return null;
    }
  },
  setActive(run: ChallengeRun | null) {
    if (run) write(ACTIVE_KEY, JSON.stringify(run));
    else {
      try {
        window.localStorage.removeItem(ACTIVE_KEY);
        window.dispatchEvent(new Event("valo:runs"));
      } catch {
        /* noop */
      }
    }
  },
  getHistory(): ChallengeRun[] {
    try {
      const raw = read(HISTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? (arr as ChallengeRun[]) : [];
    } catch {
      return [];
    }
  },
  finish(run: ChallengeRun, status: "cleared" | "failed"): ChallengeRun {
    const done: ChallengeRun = {
      ...run,
      status,
      finishedAt: Date.now(),
    };
    const hist = [done, ...this.getHistory()].slice(0, MAX_HISTORY);
    write(HISTORY_KEY, JSON.stringify(hist));
    this.setActive(null);
    return done;
  },
  remove(id: string) {
    write(
      HISTORY_KEY,
      JSON.stringify(this.getHistory().filter((r) => r.id !== id)),
    );
  },
};

/* ---------------------------- share plumbing -------------------------- */

export const CHALLENGE_RUN_URL = `${SITE_URL}/challenge-run`;
export const SHOWCASE_URL = `${SITE_URL}/showcase`;

export function runCaption(run: ChallengeRun): string {
  const verdict =
    run.status === "cleared"
      ? "CHALLENGE CLEARED."
      : run.status === "failed"
        ? "CHALLENGE FAILED. BLAME FATE."
        : "CHALLENGE ACCEPTED.";
  return (
    `ROLL. LOCK. PLAY.\n` +
    `\n` +
    `VALO ROULETTE // ${verdict}\n` +
    `${run.agent} (${run.role}) | ${run.weapon} only\n` +
    `Mission: ${run.challenge}\n` +
    `Modifier: ${run.modifier}\n` +
    `No rerolls.\n` +
    `\n` +
    `Roll your fate: ${CHALLENGE_RUN_URL}`
  );
}

export function shareLinks(caption: string, pageUrl: string): {
  x: string;
  whatsapp: string;
  telegram: string;
} {
  const text = encodeURIComponent(caption);
  const url = encodeURIComponent(pageUrl);
  return {
    x: `https://x.com/intent/post?text=${text}`,
    whatsapp: `https://wa.me/?text=${text}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
  };
}
