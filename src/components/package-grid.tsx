import { PackageCard } from "@/components/package-card";
import type { CatalogPackage } from "@/lib/catalog";

export function PackageGrid({ items }: { items: CatalogPackage[] }) {
  if (!items.length) {
    return <div className="empty-state"><span>✳</span><h2>No matching trips yet</h2><p>Try a broader destination or clear a filter. A planner can also create a custom route.</p><a className="button button-outline" href="/plan-your-trip">Ask for a custom trip</a></div>;
  }
  return <div className="package-grid">{items.map((item) => <PackageCard key={item.slug} item={item} />)}</div>;
}
