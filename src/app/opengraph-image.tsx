import { ImageResponse } from "next/og";
import { couple } from "@/lib/couple";

export const alt = `${couple.groom.firstName} & ${couple.bride.firstName} — 23.01.2027`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    },
  }).then((r) => r.text());
  const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('(truetype|woff)'\)/);
  if (!match) return null;
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const displayText = "AKASH & FALGUNI 23 01 2027";
  const italicText = "save the date";

  const [italianaData, cormorantItalicData] = await Promise.all([
    loadGoogleFont("Italiana", displayText).catch(() => null),
    loadGoogleFont("Cormorant+Garamond:ital,wght@1,500", italicText).catch(() => null),
  ]);

  const fonts: { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 | 500 }[] = [];
  if (italianaData) fonts.push({ name: "Italiana", data: italianaData, style: "normal", weight: 400 });
  if (cormorantItalicData) fonts.push({ name: "Cormorant", data: cormorantItalicData, style: "italic", weight: 500 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 45%, #1B1B3A 0%, #0F0F26 70%)",
          color: "#F5E6C9",
          fontFamily: italianaData ? "Italiana" : "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(212,168,75,0.18) 0%, rgba(212,168,75,0) 50%)",
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 18,
            letterSpacing: "0.55em",
            color: "#D4A84B",
            textTransform: "uppercase",
            marginBottom: 44,
            fontFamily: "sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span
            style={{
              width: 44,
              height: 1,
              backgroundColor: "#D4A84B",
              display: "flex",
            }}
          />
          <span>A Wedding Invitation</span>
          <span
            style={{
              width: 44,
              height: 1,
              backgroundColor: "#D4A84B",
              display: "flex",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            fontSize: 116,
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          <span>AKASH</span>
          <span
            style={{
              color: "#D4A84B",
              fontSize: 150,
              fontFamily: cormorantItalicData ? "Cormorant" : "serif",
              fontStyle: "italic",
              letterSpacing: 0,
              transform: "translateY(-10px)",
              display: "flex",
            }}
          >
            &
          </span>
          <span>FALGUNI</span>
        </div>

        <div
          style={{
            width: 140,
            height: 1,
            backgroundColor: "#D4A84B",
            marginTop: 42,
            marginBottom: 30,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 52,
            letterSpacing: "0.22em",
            display: "flex",
          }}
        >
          23 · 01 · 2027
        </div>

        <div
          style={{
            fontSize: 22,
            fontFamily: cormorantItalicData ? "Cormorant" : "serif",
            fontStyle: "italic",
            color: "#E4D4A8",
            marginTop: 30,
            letterSpacing: "0.04em",
            display: "flex",
          }}
        >
          {italicText}
        </div>

        <div
          style={{
            position: "absolute",
            top: 36,
            left: 40,
            fontSize: 12,
            letterSpacing: "0.4em",
            color: "#D4A84B",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          A · F
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 40,
            fontSize: 12,
            letterSpacing: "0.4em",
            color: "#D4A84B",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Aligarh · India
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
