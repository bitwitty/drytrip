import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const subtitle = searchParams.get("subtitle");

  const tagline = subtitle
    ?? "Luxury travel rated for the alcohol-free experience. Verified venues, AI trip planning, zero compromises.";

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

        {/* Dynamic title (e.g. city name or page title) */}
        {title && (
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#F9F7F2",
              textAlign: "center",
              maxWidth: 900,
              marginTop: 28,
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
        )}

        {/* Tagline / subtitle */}
        <div
          style={{
            fontSize: title ? 20 : 22,
            color: "#F9F7F2",
            opacity: 0.6,
            textAlign: "center",
            maxWidth: 750,
            marginTop: title ? 16 : 28,
            lineHeight: 1.6,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
