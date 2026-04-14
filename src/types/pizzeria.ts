export interface Pizzeria {
  id: string;
  slug: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  priceRange: string;
  specialties: string[];
  services: string[];
  description: string;
  phone: string;
  address: string;
  types: ('sur-place' | 'emporter' | 'livraison')[];
  reviewsLink?: string;
  googleMapsLink?: string;
  openingHours?: string;
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  latitude?: number;
  longitude?: number;
  geocodedAt?: string;
  geocodingStatus?: string;
  halal: boolean;
}

export interface GeographicSector {
  id: string;
  name: string;
  slug: string;
  center_lat: number;
  center_lng: number;
  radius: number;
  postal_code?: string;
  display_name?: string;
  display_order?: number;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  seo_content?: import('@/types/city').SeoContentData;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Filters {
  priceRange: string;
  rating: number;
  sector: string;
  halalOnly: boolean;
  showTop10: boolean;
}
