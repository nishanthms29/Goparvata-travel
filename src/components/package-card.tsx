import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { formatInr } from "@/lib/pricing";
import type { CatalogPackage } from "@/lib/catalog";

export function PackageCard({ item }: { item: CatalogPackage }) {
  return (
    <article className="package-card">
      <Link className="package-image" href={`/packages/${item.slug}`} aria-label={`View ${item.name}`}>
        <Image src={item.imageUrl} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
        <span className="photo-tag">{item.sampleOffer ? "Sample itinerary" : item.category.toLowerCase()}</span>
        <span className="photo-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="package-content">
        <p className="package-meta"><span><MapPin size={14} />{item.destination.name}, {item.destination.country}</span><span><Clock3 size={14} />{item.days} days</span></p>
        <h3><Link href={`/packages/${item.slug}`}>{item.name}</Link></h3>
        <p className="package-copy">{item.shortDescription}</p>
        <div className="package-bottom"><span><small>Planning estimate from</small><strong>{formatInr(item.adultPricePaise)}</strong><small>per adult · sample rate</small></span><Link href={`/packages/${item.slug}`} className="text-arrow" aria-label={`View ${item.name}`}>Explore <span aria-hidden="true">→</span></Link></div>
      </div>
    </article>
  );
}
