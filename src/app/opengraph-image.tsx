import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — Capital has gravity.`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(180deg, #79c8f5 0%, #a9ddf7 100%)",
          color: "#071a2b",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#071a2b",
              borderRadius: 6,
            }}
          >
            <svg viewBox="230 245 620 545" width="34" height="34" fill="#ffffff">
              <polygon points="473,270 608,270 684,347 502,347 306,540 256,490" />
              <polygon points="541,432 773,432 826,489 541,768 372,603 423,551 539,667 703,503 577,503 534,548 479,494" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.2em",
            }}
          >
            {site.wordmark}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 128,
            fontWeight: 700,
            lineHeight: 0.86,
            letterSpacing: "-0.04em",
          }}
        >
          <div>CAPITAL</div>
          <div>HAS GRAVITY.</div>
        </div>

        <div style={{ fontSize: 26, color: "#0b2842" }}>{site.secondary}</div>
      </div>
    ),
    size,
  );
}
