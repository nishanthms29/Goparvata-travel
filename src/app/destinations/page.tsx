import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { demoDestinations } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Browse thoughtful trip ideas around India and beyond, and ask a Bengaluru-based planner to tailor your route.",
};

export default function DestinationsPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><p className="eyebrow"><span /> A MAP FULL OF MAYBES</p><h1>Somewhere can<br />be <em>the beginning.</em></h1><p>Browse destination ideas, then ask for a route that fits your season, budget and travel style.</p></div></section>
      <section className="content-section shell">
        <div className="demo-banner">Destination stories are editorial planning guides. Travel conditions, entry requirements, safety advice and supplier availability should be reconfirmed before travel.</div>
        <div className="destination-directory">{demoDestinations.map((destination) => <Link className="directory-card" href={`/destinations/${destination.slug}`} key={destination.slug}><span className="directory-image"><Image src={destination.imageUrl} alt={destination.alt} fill sizes="(max-width: 650px) 100vw, 50vw" /></span><span><small>{destination.country}</small><strong>{destination.name}</strong><span>Explore this destination →</span></span></Link>)}</div>
      </section>
    </>
  );
}
