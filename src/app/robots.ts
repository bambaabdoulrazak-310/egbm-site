import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/espace-entreprise", "/connexion"],
    },
    sitemap: "https://egbmci.com/sitemap.xml",
  };
}
