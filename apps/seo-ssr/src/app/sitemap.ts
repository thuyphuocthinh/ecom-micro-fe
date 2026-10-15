import type { MetadataRoute } from "next";
import { fetchSitemapData } from "@/services/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicItems = await fetchSitemapData();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicItems.map((item) => ({
    url: `${SITE_URL}${item.loc}`,
    lastModified: new Date(item.lastmod),
    changeFrequency: item.changefreq,
    priority: item.priority,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
