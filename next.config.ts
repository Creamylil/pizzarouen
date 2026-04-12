import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucafalcdmkvpxynoykjt.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/larret-pizza",
        destination: "/bihorel/larret-pizza",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
