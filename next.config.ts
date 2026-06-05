import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // force webpack for stability if turbopack issues
  },
};

export default nextConfig;
