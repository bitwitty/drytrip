import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1B3022",
          padding: "60px 80px",
        }}
      >
        {/* Logo symbol — horizon line + rising sun */}
        <svg
          viewBox="0 0 80 50"
          width="160"
          height="100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="40"
            x2="80"
            y2="40"
            stroke="#F9F7F2"
            strokeWidth="2.5"
          />
          <path
            d="M 16 40 A 24 24 0 0 1 64 40"
            stroke="#F9F7F2"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 300,
            color: "#F9F7F2",
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            marginTop: 24,
          }}
        >
          Dry Trip
        </div>

        {/* Sandstone accent line */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: "#D9C5B2",
            marginTop: 32,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#F9F7F2",
            opacity: 0.6,
            textAlign: "center",
            maxWidth: 750,
            marginTop: 28,
            lineHeight: 1.6,
          }}
        >
          Luxury travel rated for the alcohol-free experience. Verified venues,
          AI trip planning, zero compromises.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
