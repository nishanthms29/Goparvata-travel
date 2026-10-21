import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { getPackages } from "@/lib/catalog";
import { PackageGrid } from "@/components/package-grid";
import { db } from "@/lib/db";

const guideContent: Record<string, { title: string; country: string; description: string; bestTime: string; duration: string; attractions: string[]; image: string }> = {
  kerala: { title: "Kerala", country: "India · Kerala", description: "Backwaters, tea-country hills and port-city neighborhoods reward a route with breathing room. These notes are a starting point; confirm seasonal conditions and transport with a local planner.", bestTime: "Usually October–March; verify seasonal weather before travel", duration: "5–8 days", attractions: ["Alleppey backwaters", "Munnar tea gardens", "Fort Kochi"], image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85" },
  ladakh: { title: "Ladakh", country: "India · Ladakh", description: "A high-altitude landscape where a gradual pace matters. Acclimatization, road access, permits and weather can change; verify current guidance before arranging travel.", bestTime: "Typically June–September; confirm current road and weather conditions", duration: "7–10 days", attractions: ["Leh town", "Nubra Valley", "Pangong Lake"], image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85" },
  rajasthan: { title: "Rajasthan", country: "India · Rajasthan", description: "Fort cities, historic neighborhoods and desert country connect well by rail and road. Choose a realistic number of stops and let each city have time.", bestTime: "Generally October–March; check local heat and festival dates", duration: "7–12 days", attractions: ["Jaipur old city", "Jodhpur Fort", "Udaipur lakes"], image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1600&q=85" },
  bali: { title: "Bali", country: "Indonesia", description: "From Ubud's inland scenery to coastal stays, Bali is best planned around realistic road times, local customs and current entry requirements.", bestTime: "Usually April–October; verify current seasonal conditions", duration: "6–9 days", attractions: ["Ubud", "Uluwatu", "Mount Batur"], image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideContent[slug];
  return guide ? { title: `${guide.title} travel guide`, description: guide.description, openGraph: { images: [guide.image] } } : { title: "Destination not found" };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let guide = guideContent[slug];
  let destination = null;
  try {
    destination = await db.destination.findFirst({ where: { slug, published: true }, select: { name: true, country: true, state: true, description: true, bestTimeToVisit: true, suggestedDuration: true, attractions: true, imageUrl: true } });
  } catch (error) {
    console.error("Destination lookup unavailable; using the public editorial sample guide.", error instanceof Error ? error.message : error);
  }
  if (destination) {
    const attractions = Array.isArray(destination.attractions)
      ? destination.attractions.filter((value): value is string => typeof value === "string")
      : [];
    guide = { title: destination.name, country: [destination.state, destination.country].filter(Boolean).join(" · "), description: destination.description, bestTime: destination.bestTimeToVisit || "Confirm seasonal conditions before travel.", duration: destination.suggestedDuration || "Ask a planner", attractions, image: destination.imageUrl || guideContent.kerala.image };
  }
  if (!guide) notFound();
  const packages = await getPackages({ destination: slug, pageSize: 6 });
  return (
    <>
      <section className="destination-detail-hero">
        <Image src={guide.image} alt={`${guide.title} travel scenery`} fill priority sizes="100vw" />
        <div className="destination-detail-overlay" />
        <div className="shell destination-detail-copy"><p className="eyebrow eyebrow-light"><span /> {guide.country}</p><h1>{guide.title},<br /><em>at your pace.</em></h1><p>{guide.description}</p><Link className="button button-lime" href={`/plan-your-trip?destination=${encodeURIComponent(guide.title)}`}>Plan this trip <ArrowUpRight size={16} /></Link></div>
      </section>
      <section className="shell destination-facts"><div><CalendarDays size={19} /><span><small>Often best considered</small><strong>{guide.bestTime}</strong></span></div><div><MapPin size={19} /><span><small>Suggested time</small><strong>{guide.duration}</strong></span></div><div><span className="fact-mark">01</span><span><small>Places to explore</small><strong>{guide.attractions.length} starting points</strong></span></div></section>
      <section className="section shell"><div className="section-heading"><div><p className="eyebrow"><span /> SAMPLE ROUTES</p><h2>Trips that pass<br />through <em>{guide.title}.</em></h2></div><p className="section-intro">These are planning concepts, not available departures. Ask for current pricing and supplier confirmation before making arrangements.</p></div>{packages.demo && <p className="demo-banner">Development sample routes only. Connect PostgreSQL for package management and enquiry storage.</p>}<PackageGrid items={packages.items} /></section>
    </>
  );
}
