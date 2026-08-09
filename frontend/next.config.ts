import type { NextConfig } from "next";

const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "https://sahayak-health-ai-health-companion-production.up.railway.app";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "");
};

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.211.47.239", "localhost", "127.0.0.1", "0.0.0.0"],
  devIndicators: false,
  reactStrictMode: false,
  async rewrites() {
    const baseUrl = getApiUrl();
    return [
      {
        source: "/api/chat",
        destination: `${baseUrl}/api/chat`,
      },
      {
        source: "/api/summary",
        destination: `${baseUrl}/api/summary`,
      },
    ];
  },
};

export default nextConfig;
