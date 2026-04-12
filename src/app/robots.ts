import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/404"],
      },
    ],
    sitemap: "https://pizzarouen.fr/sitemap.xml",
  };
}
