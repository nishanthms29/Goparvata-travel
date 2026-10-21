import { ContentStatus, PackageCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type CatalogPackage = {
  slug: string;
  name: string;
  destination: { name: string; country: string; slug?: string };
  category: PackageCategory;
  shortDescription: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  days: number;
  nights: number;
  adultPricePaise: number;
  childPricePaise?: number | null;
  featured: boolean;
  sampleOffer: boolean;
  imageUrl: string;
  alt: string;
};

function toStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const demoPackages: CatalogPackage[] = [
  { slug: "kerala-backwaters-and-hills", name: "Kerala Backwaters & Hills", destination: { name: "Kerala", country: "India", slug: "kerala" }, category: PackageCategory.FAMILY, shortDescription: "A slower-paced week from Munnar's tea gardens to Alleppey's backwaters.", description: "A sample itinerary for a private Kerala trip. Stays, transport and seasonal availability are confirmed only after a planner reviews your request.", days: 6, nights: 5, adultPricePaise: 2850000, childPricePaise: 1450000, featured: true, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85", alt: "Kerala backwaters surrounded by palms" },
  { slug: "ladakh-highland-trail", name: "Ladakh Highland Trail", destination: { name: "Ladakh", country: "India", slug: "ladakh" }, category: PackageCategory.ADVENTURE, shortDescription: "A gradual acclimatization-focused route through Leh, Nubra and Pangong.", description: "Sample land itinerary. Road conditions, permits and stays are subject to local confirmation.", days: 8, nights: 7, adultPricePaise: 4950000, featured: true, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85", alt: "High Himalayan mountain landscape in Ladakh" },
  { slug: "rajasthan-heritage-route", name: "Rajasthan Heritage Route", destination: { name: "Rajasthan", country: "India", slug: "rajasthan" }, category: PackageCategory.GROUP, shortDescription: "A sample Jaipur–Jodhpur–Udaipur route with time for local neighborhoods.", description: "An editable heritage route concept. Guides and hotels are not live inventory and need written confirmation.", days: 8, nights: 7, adultPricePaise: 4250000, featured: true, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1600&q=85", alt: "Rajasthan palace architecture at sunset" },
  { slug: "goa-coast-and-culture", name: "Goa Coast & Culture", destination: { name: "Goa", country: "India", slug: "goa" }, category: PackageCategory.DOMESTIC, shortDescription: "A short coastal break balancing heritage lanes and quiet beach time.", description: "A sample Goa stay. Seasonal access and accommodation require confirmation.", days: 5, nights: 4, adultPricePaise: 2250000, featured: false, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85", alt: "Goa coastline and beach" },
  { slug: "kyoto-first-look", name: "Kyoto First Look", destination: { name: "Kyoto", country: "Japan", slug: "kyoto" }, category: PackageCategory.INTERNATIONAL, shortDescription: "A sample introduction to Kyoto with onward travel planning.", description: "A planning concept only. Flights, visas, hotels and entry requirements need independent confirmation.", days: 6, nights: 5, adultPricePaise: 12400000, featured: true, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85", alt: "Traditional Kyoto street at dusk" },
  { slug: "bali-island-escape", name: "Bali Island Escape", destination: { name: "Bali", country: "Indonesia", slug: "bali" }, category: PackageCategory.HONEYMOON, shortDescription: "A customizable island stay mixing Ubud, coastline and downtime.", description: "A sample planning rate. Entry rules, accommodation and transfers require confirmation.", days: 7, nights: 6, adultPricePaise: 10200000, featured: true, sampleOffer: true, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85", alt: "Bali rice terraces and tropical scenery" },
];

export async function getPackages(options: {
  featured?: boolean;
  category?: PackageCategory;
  query?: string;
  destination?: string;
  minPriceRupees?: number;
  maxPriceRupees?: number;
  familyFriendly?: boolean;
  honeymoon?: boolean;
  sort?: "price" | "newest" | "popular";
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: CatalogPackage[]; total: number; demo: boolean }> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 9;
  const where: Prisma.TourPackageWhereInput = {
    status: ContentStatus.PUBLISHED,
    ...(options.featured ? { featured: true } : {}),
    ...(options.category ? { category: options.category } : {}),
    ...(options.familyFriendly ? { familyFriendly: true } : {}),
    ...(options.honeymoon ? { honeymoon: true } : {}),
    ...(options.minPriceRupees !== undefined || options.maxPriceRupees !== undefined
      ? { adultPricePaise: { ...(options.minPriceRupees !== undefined ? { gte: options.minPriceRupees * 100 } : {}), ...(options.maxPriceRupees !== undefined ? { lte: options.maxPriceRupees * 100 } : {}) } }
      : {}),
    ...(options.destination ? { destination: { slug: options.destination } } : {}),
    ...(options.query ? { OR: [{ name: { contains: options.query } }, { shortDescription: { contains: options.query } }, { destination: { name: { contains: options.query } } }] } : {}),
  };

  try {
    const [rows, total] = await Promise.all([
      db.tourPackage.findMany({
        where,
        include: { destination: { select: { name: true, country: true, slug: true, imageUrl: true } }, images: { orderBy: { displayOrder: "asc" }, take: 1 } },
        orderBy: options.sort === "price" ? { adultPricePaise: "asc" } : options.sort === "newest" ? { createdAt: "desc" } : [{ featured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.tourPackage.count({ where }),
    ]);
    return {
      items: rows.map((item) => ({
        ...item,
        destination: item.destination,
        imageUrl: item.images[0]?.url ?? item.destination.imageUrl ?? demoPackages[0].imageUrl,
        alt: item.images[0]?.alt ?? `${item.destination.name} travel scenery`,
      })),
      total,
      demo: false,
    };
  } catch (error) {
    console.error("Package catalog unavailable; showing clearly marked development samples.", error instanceof Error ? error.message : error);
    let rows = demoPackages;
    if (options.category) rows = rows.filter((item) => item.category === options.category);
    if (options.featured) rows = rows.filter((item) => item.featured);
    if (options.destination) rows = rows.filter((item) => item.destination.slug === options.destination);
    if (options.query) {
      const q = options.query.toLowerCase();
      rows = rows.filter((item) => `${item.name} ${item.shortDescription} ${item.destination.name}`.toLowerCase().includes(q));
    }
    if (options.minPriceRupees !== undefined) rows = rows.filter((item) => item.adultPricePaise >= options.minPriceRupees! * 100);
    if (options.maxPriceRupees !== undefined) rows = rows.filter((item) => item.adultPricePaise <= options.maxPriceRupees! * 100);
    if (options.honeymoon) rows = rows.filter((item) => item.category === PackageCategory.HONEYMOON);
    if (options.sort === "price") rows = [...rows].sort((a, b) => a.adultPricePaise - b.adultPricePaise);
    return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, demo: true };
  }
}

export async function getPackage(slug: string): Promise<{ item: CatalogPackage & { itinerary?: { day: number; title: string; description: string }[]; cancellationPolicy?: string; included?: string[]; excluded?: string[] }; demo: boolean } | null> {
  try {
    const item = await db.tourPackage.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: {
        destination: { select: { name: true, country: true, slug: true, imageUrl: true } },
        images: { orderBy: { displayOrder: "asc" } },
        itinerary: { orderBy: { day: "asc" } },
      },
    });
    if (!item) return null;
    return {
      item: {
        ...item,
        destination: item.destination,
        included: toStringArray(item.included),
        excluded: toStringArray(item.excluded),
        imageUrl: item.images[0]?.url ?? demoPackages[0].imageUrl,
        alt: item.images[0]?.alt ?? `${item.destination.name} travel scenery`,
      },
      demo: false,
    };
  } catch (error) {
    console.error("Package detail unavailable; showing clearly marked development samples.", error instanceof Error ? error.message : error);
    const item = demoPackages.find((candidate) => candidate.slug === slug);
    if (!item) return null;
    return { item, demo: true };
  }
}

export const demoDestinations = [
  { name: "Kerala", slug: "kerala", country: "India", imageUrl: demoPackages[0].imageUrl, alt: "Kerala backwaters surrounded by palms" },
  { name: "Ladakh", slug: "ladakh", country: "India", imageUrl: demoPackages[1].imageUrl, alt: "High Himalayan mountain landscape" },
  { name: "Rajasthan", slug: "rajasthan", country: "India", imageUrl: demoPackages[2].imageUrl, alt: "Rajasthan palace architecture" },
  { name: "Bali", slug: "bali", country: "Indonesia", imageUrl: demoPackages[5].imageUrl, alt: "Bali rice terraces and tropical scenery" },
];
