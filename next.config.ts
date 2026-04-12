import type { NextConfig } from "next";
import { createClient } from "@supabase/supabase-js";

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
    const citySlug = process.env.CITY_SLUG;
    if (!citySlug) return [];

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: city } = await supabase
        .from("cities")
        .select("id")
        .eq("slug", citySlug)
        .single();

      if (!city) return [];

      const { data: redirects } = await supabase
        .from("city_redirects")
        .select("source_path, destination_path, permanent")
        .eq("city_id", city.id);

      if (!redirects || redirects.length === 0) return [];

      return redirects.map((r) => ({
        source: r.source_path,
        destination: r.destination_path,
        permanent: r.permanent ?? true,
      }));
    } catch {
      return [];
    }
  },
};

export default nextConfig;
