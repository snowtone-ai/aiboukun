import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aiboukun.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/help", "/contact", "/terms", "/privacy", "/tokushoho"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
