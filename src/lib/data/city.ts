import { cache } from 'react';
import { createServerSupabaseClient } from '../supabase/server';
import type { CityConfig } from '@/types/city';

export function getCitySlug(): string {
  const slug = process.env.CITY_SLUG;
  if (!slug) {
    throw new Error('CITY_SLUG environment variable is not set');
  }
  return slug;
}

export const fetchCityConfig = cache(async (): Promise<CityConfig> => {
  const slug = getCitySlug();
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    throw new Error(`City config not found for slug: ${slug}`);
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    displayName: data.display_name,
    domain: data.domain,
    siteUrl: data.site_url,
    centerLat: Number(data.center_lat),
    centerLng: Number(data.center_lng),
    defaultZoom: data.default_zoom,
    geoRegion: data.geo_region,
    geoPlacename: data.geo_placename,
    addressRegion: data.address_region,
    defaultSectorSlug: data.default_sector_slug,
    mainPostalCodes: data.main_postal_codes,
    metaTitle: data.meta_title,
    metaTitleTemplate: data.meta_title_template,
    metaDescription: data.meta_description,
    metaKeywords: data.meta_keywords,
    ogSiteName: data.og_site_name,
    googleAnalyticsId: data.google_analytics_id,
    contactEmail: data.contact_email,
    contactWhatsapp: data.contact_whatsapp,
    logoUrl: data.logo_url,
    heroImageUrl: data.hero_image_url,
    editorName: data.editor_name,
    seoContent: data.seo_content as CityConfig['seoContent'],
  };
});
