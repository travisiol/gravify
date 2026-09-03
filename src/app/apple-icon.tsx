import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#79c8f5",
        }}
      >
        <svg viewBox="230 245 620 545" width="118" height="118" fill="#ffffff">
          <polygon points="473,270 608,270 684,347 502,347 306,540 256,490" />
          <polygon points="541,432 773,432 826,489 541,768 372,603 423,551 539,667 703,503 577,503 534,548 479,494" />
        </svg>
      </div>
    ),
    size,
  );
}
