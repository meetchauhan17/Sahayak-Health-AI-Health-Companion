import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.211.47.239", "localhost", "127.0.0.1", "0.0.0.0"],
  devIndicators: false,
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/chat",
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
          : "http://localhost:8000/api/chat",
      },
      {
        source: "/api/summary",
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/summary`
          : "http://localhost:8000/api/summary",
      },
    ];
  },
};

export default nextConfig;
