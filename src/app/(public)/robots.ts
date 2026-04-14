import { MetadataRoute } from "next";
import { fetchCityConfig } from "@/lib/data/city";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const city = await fetchCityConfig();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/404", "/admin"],
      },
    ],
    sitemap: `${city.siteUrl}/sitemap.xml`,
  };
}
