import type { Metadata } from "next";
import { PackageCategory } from "@prisma/client";
import { PackageGrid } from "@/components/package-grid";
import { getPackages } from "@/lib/catalog";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample tour packages",
  description: "Explore sample domestic, international and adventure itineraries. Ask for a written quote before booking.",
};

const categories: Record<string, PackageCategory> = {
  domestic: PackageCategory.DOMESTIC,
  international: PackageCategory.INTERNATIONAL,
  adventure: PackageCategory.ADVENTURE,
  honeymoon: PackageCategory.HONEYMOON,
  family: PackageCategory.FAMILY,
  group: PackageCategory.GROUP,
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categoryValue = typeof params.category === "string" ? params.category.toLowerCase() : "";
  const category = categories[categoryValue];
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const result = await getPackages({
    category,
    query,
    minPriceRupees: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPriceRupees: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort: params.sort === "price" ? "price" : params.sort === "newest" ? "newest" : "popular",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: 9,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / 9));
  return (
    <>
      <section className="page-hero"><div className="shell"><p className="eyebrow"><span /> FIND YOUR WAY OUT THERE</p><h1>Routes to get<br />your thoughts <em>going.</em></h1><p>These are planning examples, not live deals or confirmed availability. Tell us what caught your eye and a planner will confirm the real-world details in writing.</p></div></section>
      <section className="content-section shell">
        <div className="demo-banner">Sample itineraries and planning estimates only. Supplier availability, inclusions and final pricing are confirmed separately before you commit.</div>
        <div className="list-toolbar"><span>{result.total} sample {result.total === 1 ? "route" : "routes"}{query ? ` matching “${query}”` : ""}</span>
          <form action="/packages" className="filter-form">
            {category && <input type="hidden" name="category" value={categoryValue} />}
            <input aria-label="Search destinations or trips" name="q" defaultValue={query} placeholder="Search trips" maxLength={100} />
            <select aria-label="Sort packages" name="sort" defaultValue={typeof params.sort === "string" ? params.sort : "popular"}><option value="popular">Featured</option><option value="price">Price: low to high</option><option value="newest">Newest</option></select>
            <select aria-label="Maximum budget per person" name="maxPrice" defaultValue={typeof params.maxPrice === "string" ? params.maxPrice : ""}><option value="">Any budget</option><option value="30000">Up to ₹30,000</option><option value="60000">Up to ₹60,000</option><option value="120000">Up to ₹1,20,000</option><option value="250000">Up to ₹2,50,000</option></select>
            <button className="button button-dark" type="submit">Filter</button>
          </form>
        </div>
        {result.demo && <p className="demo-banner">Showing clearly marked development samples because PostgreSQL is not connected yet. Booking requests are disabled until the database is configured.</p>}
        <PackageGrid items={result.items} />
        {totalPages > 1 && <nav className="pagination" aria-label="Package results pages">
          {page > 1 && <Link href={{ pathname: "/packages", query: { ...params, page: String(page - 1) } }}>← Previous</Link>}
          <span>Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={{ pathname: "/packages", query: { ...params, page: String(page + 1) } }}>Next →</Link>}
        </nav>}
        <p className="catalog-smallprint">Prices shown in INR per adult are sample planning estimates, not offers. Final price depends on dates, supplier availability, inclusions and the written quotation.</p>
      </section>
    </>
  );
}
