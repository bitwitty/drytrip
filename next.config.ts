import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline for its runtime scripts;
              // TinaCMS requires unsafe-eval in dev.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.posthog.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' *.supabase.co eu.i.posthog.com eu-assets.i.posthog.com api.anthropic.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Prevent this site from being embedded in iframes
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent browsers from MIME-sniffing response types
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send origin only on same-origin navigations, no referrer cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  webpack: (config, { isServer }) => {
    // mapbox-gl references browser globals — exclude from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("mapbox-gl");
      }
    }
    return config;
  },
};

export default nextConfig;
