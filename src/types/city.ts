export interface CityConfig {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  domain: string;
  siteUrl: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  geoRegion: string;
  geoPlacename: string;
  addressRegion: string;
  defaultSectorSlug: string;
  mainPostalCodes: string[];
  metaTitle: string;
  metaTitleTemplate: string;
  metaDescription: string;
  metaKeywords: string[];
  ogSiteName: string;
  googleAnalyticsId: string | null;
  contactEmail: string;
  contactWhatsapp: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  editorName: string;
  seoContent: SeoContentData | null;
}

export interface SeoContentSection {
  type: 'intro' | 'grid' | 'highlight' | 'info';
  title: string;
  icon?: string;
  paragraphs?: string[];
  cards?: Array<{ icon: string; heading: string; text: string; color: string }>;
}

export interface SeoContentData {
  sections: SeoContentSection[];
}
