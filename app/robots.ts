import { MetadataRoute } from "next";
import { ALLOW_INDEXING, AGENCY_CONFIG } from "@/constants/agency";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/signup", "/dashboard/", "/profile"],
    },
    sitemap: `${AGENCY_CONFIG.siteUrl}/sitemap.xml`,
  };
}
