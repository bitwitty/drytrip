import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
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
