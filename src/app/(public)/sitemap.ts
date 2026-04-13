import { MetadataRoute } from "next";
import { fetchCityConfig } from "@/lib/data/city";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const city = await fetchCityConfig();
  const baseUrl = city.siteUrl;
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
