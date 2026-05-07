import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://0gsign.netlify.app";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/create`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/documents`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/verify`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
