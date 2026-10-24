import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, MapPin, ShieldCheck } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { getPackage } from "@/lib/catalog";
import { formatInr } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPackage(slug);
  if (!result) return { title: "Trip not found" };
  return {
    title: result.item.seoTitle || result.item.name,
    description: result.item.seoDescription || result.item.shortDescription,
    openGraph: { images: [result.item.imageUrl] },
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPackage(slug);
  if (!result) notFound();
  const item = result.item;
  const days = item.itinerary ?? [];
  return (
    <>
      <section className="detail-hero">
        <div className="detail-photo"><Image src={item.imageUrl} alt={item.alt} fill priority sizes="(max-width: 700px) 100vw, 50vw" /></div>
        <div className="detail-copy">
          <p className="eyebrow"><span /> {item.destination.country.toUpperCase()} · {item.category.toLowerCase()}</p>
          <h1>{item.name}</h1>
          <p>{item.shortDescription}</p>
          <div className="detail-facts"><span><MapPin size={14} />{item.destination.name}</span><span><Clock3 size={14} />{item.days} days · {item.nights} nights</span></div>
          <div className="price-panel"><small>Sample planning estimate · per adult</small><strong>{formatInr(item.adultPricePaise)}</strong></div>
          {result.demo && <p className="demo-banner">Development sample only. This is not a live offer or confirmed availability.</p>}
        </div>
      </section>
      <section className="shell detail-columns">
        <div>
          <article className="detail-block"><h2>A route, not a rigid schedule</h2><p>{item.description}</p><p>We’ll confirm dates, suppliers, inclusions and the final price in a written quote. No flight, hotel or transport reservation is confirmed by this sample itinerary.</p></article>
          {days.length > 0 && <article className="detail-block"><h2>A possible {item.days}-day rhythm</h2><ol className="itinerary-list">{days.map((day) => <li key={day.day}><span className="day-number">{String(day.day).padStart(2, "0")}</span><div><h3>{day.title}</h3><p>{day.description}</p></div></li>)}</ol></article>}
          {((item.included?.length ?? 0) > 0 || (item.excluded?.length ?? 0) > 0) && <article className="detail-block"><h2>What to discuss with your planner</h2><div className="inclusion-grid"><div><h3>Possible inclusions</h3><ul>{item.included?.map((value) => <li key={value}>{value}</li>)}</ul></div><div><h3>Usually not included</h3><ul>{item.excluded?.map((value) => <li key={value}>{value}</li>)}</ul></div></div></article>}
          <article className="detail-block"><h2>Booking and cancellation</h2><p>{item.cancellationPolicy || "Final booking, cancellation and refund terms are supplied with a written quotation before any payment is requested."}</p></article>
        </div>
        <aside className="booking-card">
          <h2>Interested in this route?</h2><p>Request a tailored quote. A planner will confirm availability before you decide.</p>
          <div className="demo-banner"><ShieldCheck size={14} /> Enquiry only · no reservation or payment is taken here.</div>
          {result.demo
            ? <Link className="button button-dark" href="/plan-your-trip">Request a custom quote</Link>
            : <EnquiryForm title="Ask about this trip" destination={`${item.destination.name}, ${item.destination.country}`} packageSlug={item.slug} submitLabel="Request a written quote" />}
        </aside>
      </section>
    </>
  );
}
