import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecom/ui", "@ecom/api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
