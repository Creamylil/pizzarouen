interface LocalBusinessJsonLdProps {
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  url: string;
}

export default function LocalBusinessJsonLd(props: LocalBusinessJsonLdProps) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: props.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: props.address,
      addressLocality: "Rouen",
      addressRegion: "Normandie",
      addressCountry: "FR",
    },
    servesCuisine: "Pizza",
    url: props.url,
  };

  if (props.phone) schema.telephone = props.phone;
  if (props.priceRange) schema.priceRange = props.priceRange;
  if (props.image) schema.image = props.image;

  if (props.latitude && props.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: props.latitude,
      longitude: props.longitude,
    };
  }

  if (props.rating && props.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: props.rating,
      reviewCount: props.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
