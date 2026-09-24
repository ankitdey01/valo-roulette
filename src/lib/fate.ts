import agentsData from "@/data/agents.json";
import mapsData from "@/data/maps.json";
import weaponsData from "@/data/weapons.json";

export type Ability = {
  name: string;
  description: string;
  cost: string;
};

export type Agent = {
  name: string;
  description: string;
  gender: string;
  photo: string;
  role: string;
  abilities: Ability[];
};

export type GameMap = {
  name: string;
  description: string;
  photo: string;
  sites: string[];
};

export type Weapon = {
  name: string;
  price: number;
  type: string;
};

export const AGENTS = agentsData as Agent[];
export const MAPS = mapsData as GameMap[];
export const WEAPONS = (weaponsData as Weapon[]).map((w) => w.name);
export const WEAPON_META = weaponsData as Weapon[];
export const WEAPON_TYPES = [...new Set((weaponsData as Weapon[]).map((w) => w.type))];

export function weaponByName(name: string): Weapon {
  const found = (weaponsData as Weapon[]).find((w) => w.name === name);
  if (!found) throw new Error(`Unknown weapon: ${name}`);
  return found;
}

/* Local portrait art overrides the placeholder for agents we have on disk.
   Fan-meme renders scraped from Pinterest, stored in public/agents/. */
export const LOCAL_ART = new Set([
  "astra",
  "breach",
  "brimstone",
  "chamber",
  "clove",
  "cypher",
  "deadlock",
  "fade",
  "gekko",
  "harbor",
  "iso",
  "jett",
  "kay-o",
  "killjoy",
  "miks",
  "neon",
  "omen",
  "phoenix",
  "raze",
  "reyna",
  "sage",
  "skye",
  "sova",
  "tejo",
  "veto",
  "viper",
  "vyse",
  "waylay",
  "yoru",
]);

export function hasLocalArt(name: string): boolean {
  return LOCAL_ART.has(name.toLowerCase().replace("/", "-"));
}

export function agentPhoto(agent: Agent): string {
  const key = agent.name.toLowerCase().replace("/", "-");
  if (LOCAL_ART.has(key)) return `/agents/${key}.jpg`;
  return agent.photo;
}

export function agentByName(name: string): Agent {
  const found = AGENTS.find((a) => a.name === name);
  if (!found) throw new Error(`Unknown agent: ${name}`);
  return found;
}

/* ------------------------------- RNG ---------------------------------- */

export function pickRandom<T>(pool: T[], exclude: T[] = []): T {
  const avail = pool.filter((x) => !exclude.includes(x));
  const src = avail.length > 0 ? avail : pool;
  return src[Math.floor(Math.random() * src.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Seeded RNG so the daily is stable all day yet unique per player. */

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MINI_TRIALS = [
  "First blood",
  "Plant the spike",
  "Defuse the spike",
  "Ability kill",
  "Sheriff round",
  "No-armor round",
  "Use your ult",
  "2K in one round",
  "Clutch a round",
  "Ability assist",
  "Off-meta gun kill",
  "Eco round win",
  "Knife kill",
  "Win a 1v1",
  "Get an ace",
  "No-ability round",
  "Entry first",
  "Survive the half",
] as const;

export type DailySpec = {
  agent: Agent;
  challenge: string;
  trials: string[];
};

export function dailyFor(dateStr: string, salt: string): DailySpec {
  const rnd = mulberry32(hashSeed(`${dateStr}:${salt}`));
  const agent = AGENTS[Math.floor(rnd() * AGENTS.length)];
  const challenge = CHALLENGES[Math.floor(rnd() * CHALLENGES.length)];
  const pool = [...MINI_TRIALS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { agent, challenge, trials: pool.slice(0, 9) };
}

/* ------------------------------ storage ------------------------------- */

function read(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable, play on */
  }
  try {
    window.dispatchEvent(new Event("valo:update"));
  } catch {
    /* noop */
  }
}

export const store = {
  getSeen(): string[] {
    try {
      return JSON.parse(read("valo-seen", "[]"));
    } catch {
      return [];
    }
  },
  setSeen(v: string[]) {
    write("valo-seen", JSON.stringify(v));
  },
  getStreak(): number {
    return Number(read("valo-streak", "0")) || 0;
  },
  setStreak(v: number) {
    write("valo-streak", String(v));
  },
  getSfx(): boolean {
    return read("valo-sfx", "on") !== "off";
  },
  setSfx(on: boolean) {
    write("valo-sfx", on ? "on" : "off");
  },
  getUid(): string {
    let id = read("valo-uid", "");
    if (!id) {
      try {
        id =
          window.crypto?.randomUUID?.() ??
          Math.random().toString(36).slice(2);
      } catch {
        id = Math.random().toString(36).slice(2);
      }
      write("valo-uid", id);
    }
    return id || "anon";
  },
  bumpRolls(name: string) {
    let counts: Record<string, number> = {};
    try {
      counts = JSON.parse(read("valo-rolls", "{}"));
    } catch {
      counts = {};
    }
    counts[name] = (counts[name] ?? 0) + 1;
    write("valo-rolls", JSON.stringify(counts));
  },
  getRolls(): Record<string, number> {
    try {
      return JSON.parse(read("valo-rolls", "{}"));
    } catch {
      return {};
    }
  },
  totalRolls(): number {
    return Object.values(this.getRolls()).reduce((a, b) => a + b, 0);
  },
  mostRolled(): string | null {
    const counts = this.getRolls();
    let best: string | null = null;
    let bestN = 0;
    for (const [k, v] of Object.entries(counts)) {
      if (v > bestN) {
        bestN = v;
        best = k;
      }
    }
    return best;
  },
};

/* --------------------------- chaos tables ----------------------------- */

export const CHALLENGES = [
  "Get first blood.",
  "Plant the spike.",
  "Defuse the spike.",
  "Get a kill after using an ability.",
  "Win a round with a Sheriff.",
  "Survive a round without buying armor.",
  "Use your ultimate this round.",
  "Get two kills in one round.",
  "Clutch a round.",
  "Get an assist with your ability.",
  "Get a kill with a weapon you rarely use.",
  "Win a round with no abilities purchased.",
] as const;

export const MODIFIERS = [
  "You may not use your ultimate.",
  "Sheriff only. No excuses.",
  "No armor all game. Trust.",
  "You must entry first every round.",
  "No rerolls. Cry later.",
  "IGL duty: you call every strat.",
  "Knife round on pistol. Commit.",
] as const;

export const SYSTEM_LINES = [
  "INITIALIZING PROTOCOL...",
  "SEARCHING AGENT DATABASE...",
  "FILTERING...",
  "CALCULATING COMPATIBILITY...",
  "CONSULTING THE PROTOCOL...",
  "THIS WAS A MISTAKE.",
] as const;

export const FATE_QUIPS: Record<string, string> = {
  Jett: "Stop instalocking. Oh wait, fate did it for you.",
  Omen: "Teleport behind them. Miss everything. Classic.",
  Sage: "You are now the team medic. No pressure.",
  Sova: "Scan them. Shock them. Whiff anyway.",
  Brimstone: "Dad has arrived with orbital presents.",
  Viper: "Welcome to chemistry class. It burns.",
  Reyna: "Flashy. Try not to blind your own team.",
  Raze: "Explosions solve everything. Science.",
  Breach: "Stun first. Ask questions never.",
  Skye: "Your tiger does the work. Take the credit.",
  Yoru: "Good luck. You will need it.",
  Astra: "Big brain plays only. Stars or bust.",
  "KAY/O": "Suppress them. Then suppress your urge to reroll.",
  Chamber: "Expensive aim required. No refunds.",
  Neon: "Run fast. Die fast. Look cool.",
  Fade: "You see everything. Still lose the duel.",
  Harbor: "Someone has to place the walls. It is you.",
  Gekko: "Your buddies carry you. Admit it.",
  Deadlock: "The site is now a fortress. Enjoy.",
  Iso: "Duel everyone. Win some.",
  Clove: "Die. Come back. Die again. Repeat.",
  Vyse: "Razorvine their ankles. Hold the line.",
  Tejo: "Guided chaos. Collateral guaranteed.",
  Waylay: "Blink in. Brave or foolish, we watch.",
  Veto: "Gunplay only. As it should be.",
  Miks: "Drop the bass. Concuss the lobby.",
  Cypher: "Information gathering has been assigned to you.",
  Killjoy: "You are now responsible for everyone's safety.",
};

export function quipFor(name: string): string {
  return FATE_QUIPS[name] ?? "The agent has been chosen. Don't blame us.";
}

/* --------------------------- sfx (original) --------------------------- */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, ms: number, type: OscillatorType = "square") {
  if (!store.getSfx()) return;
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + ms / 1000);
}

export const sfx = {
  tick: () => blip(660 + Math.random() * 220, 45),
  click: () => blip(440, 60),
  lock: () => {
    blip(130, 220, "sawtooth");
    setTimeout(() => blip(520, 120), 120);
  },
  toggle: () => blip(880, 70),
};
