/**
 * Types partagés pour les scripts de setup
 */

export interface CitySetupConfig {
  slug: string;
  name: string;
  displayName: string;
  domain: string;
  siteUrl: string;
  centerLat: number;
  centerLng: number;
  defaultZoom?: number;
  geoRegion: string;
  geoPlacename: string;
  addressRegion: string;
  mainPostalCodes: string[];
  contactEmail: string;
  contactWhatsapp?: string;
  editorName: string;
  googleAnalyticsId?: string | null;
  logoUrl?: string;
  heroImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface GooglePlaceResult {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: GoogleOpeningPeriod[];
    weekdayDescriptions?: string[];
  };
  photos?: { name: string; widthPx: number; heightPx: number }[];
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  editorialSummary?: { text: string; languageCode: string };
  businessStatus?: string;
  primaryType?: string;
  types?: string[];
  // Services
  dineIn?: boolean;
  takeout?: boolean;
  delivery?: boolean;
  curbsidePickup?: boolean;
  // Cuisine
  servesVegetarianFood?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesDessert?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesBreakfast?: boolean;
  // Ambiance
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  reservable?: boolean;
  goodForChildren?: boolean;
  menuForChildren?: boolean;
  goodForGroups?: boolean;
  allowsDogs?: boolean;
  restroom?: boolean;
  // Accessibilité
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  // Parking
  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;
    freeStreetParking?: boolean;
    paidStreetParking?: boolean;
    valetParking?: boolean;
    freeGarageParking?: boolean;
    paidGarageParking?: boolean;
  };
  // Paiement
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
}

export interface GoogleOpeningPeriod {
  open: { day: number; hour: number; minute: number };
  close?: { day: number; hour: number; minute: number };
}

export interface SetupStats {
  pizzeriasImported: number;
  pizzeriasSkipped: number;
  imageErrors: number;
  sectorsCreated: number;
}
