import type { MetadataRoute } from "next";
import { documentation } from "@/content/docs";
import { updates } from "@/content/updates";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const staticPages = ["", "/about", "/ecosystem", "/updates", "/docs", "/contact", "/privacy"];
  return [
    ...staticPages.map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...documentation.map((doc) => ({ url: `${baseUrl}/docs/${doc.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...updates.map((update) => ({ url: `${baseUrl}/updates/${update.slug}`, lastModified: new Date(update.date), changeFrequency: "monthly" as const, priority: 0.6 }))
  ];
}
