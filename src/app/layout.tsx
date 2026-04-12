import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import Script from "next/script";
import { fetchCityConfig } from "@/lib/data/city";
import { fetchGeographicSectors } from "@/lib/data/sectors";

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();

  return {
    metadataBase: new URL(city.siteUrl),
    title: {
      default: city.metaTitle,
      template: city.metaTitleTemplate,
    },
    description: city.metaDescription,
    keywords: city.metaKeywords,
    authors: [{ name: city.displayName }],
    openGraph: {
      type: "website",
      locale: "fr_FR",
      title: city.metaTitle,
      description: city.metaDescription,
      siteName: city.ogSiteName,
      ...(city.logoUrl ? { images: [{ url: city.logoUrl, width: 512, height: 512, alt: city.displayName }] } : {}),
    },
    twitter: {
      card: city.logoUrl ? "summary" : "summary_large_image",
      title: city.metaTitle,
      description: city.metaDescription,
      ...(city.logoUrl ? { images: [city.logoUrl] } : {}),
    },
    other: {
      "geo.region": city.geoRegion,
      "geo.placename": city.geoPlacename,
      "geo.position": `${city.centerLat};${city.centerLng}`,
      ICBM: `${city.centerLat}, ${city.centerLng}`,
    },
    icons: {
      icon: city.logoUrl?.includes("city-assets")
        ? city.logoUrl.replace("logo.webp", "favicon.ico")
        : "/favicon.ico",
      apple: city.logoUrl?.includes("city-assets")
        ? city.logoUrl.replace("logo.webp", "apple-touch-icon.png")
        : "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [city, sectors] = await Promise.all([
    fetchCityConfig(),
    fetchGeographicSectors(),
  ]);

  return (
    <html lang="fr">
      <head>
        <link
          rel="preconnect"
          href="https://ucafalcdmkvpxynoykjt.supabase.co"
        />
        {city.googleAnalyticsId && (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        )}
        {city.heroImageUrl && (
          <link
            rel="preload"
            as="image"
            href={city.heroImageUrl}
            fetchPriority="high"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <TooltipProvider>
          <main className="flex-1">{children}</main>
          <Footer cityDisplayName={city.displayName} contactEmail={city.contactEmail} contactWhatsapp={city.contactWhatsapp} logoUrl={city.logoUrl} sectors={sectors} />
          <Toaster />
        </TooltipProvider>
        {city.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${city.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${city.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
