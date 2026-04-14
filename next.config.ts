import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.synk.hu",
      },
      {
        protocol: "https",
        hostname: "cdn.synk.hu",
      },
    ],
  },
};

export default nextConfig;