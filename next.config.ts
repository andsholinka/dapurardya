import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paksa bcryptjs dan mongodb jalan di Node.js native, bukan di-bundle Turbopack
  serverExternalPackages: ["bcryptjs", "mongodb"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
    ],
    // Unoptimized di dev untuk hindari timeout Cloudinary dari lokal
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
