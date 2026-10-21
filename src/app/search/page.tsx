import type { Metadata } from "next";
import { PackageGrid } from "@/components/package-grid";
import { getPackages } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search trip ideas", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : undefined;
  const validCategories = ["DOMESTIC", "INTERNATIONAL", "ADVENTURE", "HONEYMOON", "FAMILY", "GROUP", "CORPORATE"];
  const result = await getPackages({
    query: q || undefined,
    category: validCategories.includes(category || "") ? category as typeof validCategories[number] as never : undefined,
    maxPriceRupees: typeof params.maxPrice === "string" && /^\d+$/.test(params.maxPrice) ? Number(params.maxPrice) : undefined,
    sort: params.sort === "price" ? "price" : "popular",
    page: 1,
    pageSize: 12,
  });
  return (
    <>
      <section className="page-hero"><div className="shell"><p className="eyebrow"><span /> SEARCH THE TRIP IDEAS</p><h1>{q ? <>A few ideas for<br /><em>“{q}”.</em></> : <>Let’s find a<br /><em>starting point.</em></>}</h1><p>Search results are sample planning routes, not live inventory. A planner will confirm current details before you make a decision.</p></div></section>
      <section className="content-section shell"><p className="demo-banner">Planning estimates only. No package shown here confirms a flight, hotel, departure or booking.</p><PackageGrid items={result.items} /></section>
    </>
  );
}
