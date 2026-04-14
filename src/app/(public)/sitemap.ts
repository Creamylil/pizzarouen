import { MetadataRoute } from "next";
import { fetchCityConfig } from "@/lib/data/city";
import { fetchGeographicSectors } from "@/lib/data/sectors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [city, sectors] = await Promise.all([
    fetchCityConfig(),
    fetchGeographicSectors(),
  ]);
  const baseUrl = city.siteUrl;
  const now = new Date();

  const sectorEntries: MetadataRoute.Sitemap = sectors
    .filter(s => s.is_published !== false)
    .map(sector => ({
      url: `${baseUrl}/${sector.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...sectorEntries,
  ];
}
