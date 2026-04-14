import { MetadataRoute } from "next";
import { fetchCityConfig } from "@/lib/data/city";
import { fetchGeographicSectors } from "@/lib/data/sectors";
import { fetchPizzerias } from "@/lib/data/pizzerias";
import { extractPostalCode } from "@/utils/postalCodeUtils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [city, sectors, pizzerias] = await Promise.all([
    fetchCityConfig(),
    fetchGeographicSectors(),
    fetchPizzerias(),
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

  // Pizzeria detail pages
  const pizzeriaEntries: MetadataRoute.Sitemap = [];
  for (const pizzeria of pizzerias) {
    if (!pizzeria.slug) continue;
    const pc = extractPostalCode(pizzeria.address);
    if (!pc) continue;

    // Pizzerias du centre → /{slug} directement
    if (city.mainPostalCodes.includes(pc)) {
      pizzeriaEntries.push({
        url: `${baseUrl}/${pizzeria.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
      continue;
    }

    // Pizzerias des communes → /{sector}/{slug}
    const matchingSector = sectors.find(sector => {
      if (!sector.postal_code) return false;
      if (sector.is_published === false) return false;
      return sector.postal_code === pc;
    });

    if (matchingSector) {
      pizzeriaEntries.push({
        url: `${baseUrl}/${matchingSector.slug}/${pizzeria.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...sectorEntries,
    ...pizzeriaEntries,
  ];
}
