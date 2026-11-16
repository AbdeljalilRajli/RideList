import { MetadataRoute } from "next";
import { notFound } from "next/navigation";
import { ALLOW_INDEXING, AGENCY_CONFIG } from "@/constants/agency";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!ALLOW_INDEXING) {
    notFound();
  }

  return [
    {
      url: AGENCY_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${AGENCY_CONFIG.siteUrl}/fleet`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${AGENCY_CONFIG.siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${AGENCY_CONFIG.siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
