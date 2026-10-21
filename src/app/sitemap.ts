import type { MetadataRoute } from "next";
import { ContentStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const revalidate = 3600;

const staticRoutes = [
  ["", 1],
  ["/about", 0.7],
  ["/destinations", 0.8],
  ["/packages", 0.9],
  ["/tours/adventure", 0.7],
  ["/corporate-travel", 0.5],
  ["/hotels", 0.5],
  ["/transport", 0.5],
  ["/plan-your-trip", 0.7],
  ["/consultation", 0.5],
  ["/contact", 0.6],
  ["/faq", 0.4],
  ["/blog", 0.6],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const [packages, destinations, posts] = await Promise.all([
    db.tourPackage.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    db.destination.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...staticRoutes.map(([path, priority]) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...packages.map((item) => ({
      url: `${siteUrl}/packages/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...destinations.map((item) => ({
      url: `${siteUrl}/destinations/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((item) => ({
      url: `${siteUrl}/blog/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
