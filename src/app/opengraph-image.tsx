import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<ArrayBuffer | null> {
  // Satori only parses TTF/OTF (no WOFF/WOFF2), so pull TTF from fontsource.
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/press-start-2p@latest/latin-400-normal.ttf",
    );
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage() {
  // Pixel display font with monospace fallback if the fetch fails.
  const pxFont = await loadFont();
  const family = pxFont ? '"Press Start 2P", monospace' : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0F1923",
          border: "14px solid #FF4655",
          padding: "56px 64px",
          fontFamily: family,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#FFD694",
            fontSize: 26,
          }}
        >
          <span>{"// FAN-MADE FATE MACHINE"}</span>
          <span>NO REROLLS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: "#ECE8E1", fontSize: 88, lineHeight: 1.1 }}>
            VALO ROULETTE
          </div>
          <div style={{ color: "#FF4655", fontSize: 44, lineHeight: 1.2 }}>
            WHO ARE YOU PLAYING?
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#7D8082",
            fontSize: 24,
          }}
        >
          <span>ROLL // LOCK // PLAY</span>
          <span>29 AGENTS /// 13 MAPS</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: pxFont
        ? [
            {
              name: "Press Start 2P",
              data: pxFont,
              style: "normal" as const,
              weight: 400 as const,
            },
          ]
        : undefined,
    },
  );
}
