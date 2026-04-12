import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://pizzarouen.fr"),
  title: {
    default: "Pizzerias Rouen - Ouvertes Maintenant | Livraison & Halal",
    template: "%s | Pizza Rouen",
  },
  description:
    "Découvrez les meilleures pizzerias de Rouen et sa région. Pizza livraison, à emporter et sur place. Horaires, avis et commande en ligne.",
  keywords: [
    "pizza",
    "pizzeria",
    "rouen",
    "livraison pizza",
    "pizza à emporter",
    "restaurant italien",
    "pizza halal",
    "pizzeria ouverte",
    "bihorel",
    "petit-quevilly",
    "grand-quevilly",
    "sotteville",
  ],
  authors: [{ name: "Pizza Rouen" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Pizzerias Rouen - Ouvertes Maintenant | Livraison & Halal",
    description:
      "Découvrez les meilleures pizzerias de Rouen et sa région. Pizza livraison, à emporter et sur place.",
    siteName: "Pizza Rouen",
  },
  twitter: {
    card: "summary_large_image",
    site: "@pizza_rouen",
    title: "Pizzerias Rouen - Ouvertes Maintenant | Livraison & Halal",
    description:
      "Découvrez les meilleures pizzerias de Rouen et sa région.",
  },
  other: {
    "geo.region": "FR-76",
    "geo.placename": "Rouen",
    "geo.position": "49.4432;1.0993",
    ICBM: "49.4432, 1.0993",
  },
  icons: {
    icon: "/lovable-uploads/6d184fab-0b61-4d6b-aefd-1e273823de65.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="preconnect"
          href="https://ucafalcdmkvpxynoykjt.supabase.co"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link
          rel="preload"
          as="image"
          href="/lovable-uploads/2f182011-29ef-45c7-9902-164fe4326b49.png"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <TooltipProvider>
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </TooltipProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S7LT5QBQMV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S7LT5QBQMV');
          `}
        </Script>
      </body>
    </html>
  );
}
