import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BadgeCheck, Compass, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { PackageGrid } from "@/components/package-grid";
import { getPackages } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const heroImage = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=88";

export default async function HomePage() {
  const { items, demo } = await getPackages({ featured: true, pageSize: 3 });
  return (
    <>
      <section className="hero-home">
        <Image className="hero-photo" src={heroImage} alt="Mountain lake at sunrise beneath the Himalayas" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="shell hero-content">
          <p className="eyebrow eyebrow-light"><span /> Bengaluru-based, open to the world</p>
          <h1>Your next adventure,<br /><em>planned around you.</em></h1>
          <p className="hero-description">Thoughtful routes, honest conversations and a real person to help shape the trip you actually want.</p>
          <div className="hero-actions"><Link href="/plan-your-trip" className="button button-lime">Start planning <ArrowUpRight size={17} /></Link><Link href="/packages" className="hero-secondary">Explore sample trips <ArrowDown size={15} /></Link></div>
          <p className="hero-note"><ShieldCheck size={15} /> Sample itineraries are planning ideas — availability is confirmed with you.</p>
        </div>
        <span className="hero-index">01 <span /> 04 — GO YOUR OWN WAY</span>
      </section>

      <section className="search-dock shell" aria-label="Find a trip">
        <div className="search-intro"><span className="search-icon"><MapPinned size={19} /></span><div><h2>Where are you dreaming of?</h2><p>Start with a place, and we’ll take it from there.</p></div></div>
        <SearchForm />
      </section>

      <section className="section shell destinations-section">
        <div className="section-heading">
          <div><p className="eyebrow"><span /> A few places to begin</p><h2>Trips with a sense<br />of <em>somewhere.</em></h2></div>
          <p className="section-intro">Every route is a starting point, not a fixed template. We’ll shape the details around your pace, people and plans.</p>
        </div>
        <div className="destination-tiles">
          <Link className="destination-tile tile-large" href="/destinations/kerala">
            <Image src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85" alt="A boat on the quiet Kerala backwaters" fill sizes="(max-width: 700px) 100vw, 55vw" />
            <span className="tile-content"><small>INDIA · WATER &amp; HILLS</small><strong>Kerala, at your pace</strong><span>Explore the backwaters <ArrowUpRight size={16} /></span></span>
          </Link>
          <Link className="destination-tile" href="/destinations/ladakh">
            <Image src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85" alt="Himalayan ridgelines above a mountain road" fill sizes="(max-width: 700px) 100vw, 35vw" />
            <span className="tile-content"><small>INDIA · HIGH HIMALAYA</small><strong>Ladakh, slowly</strong><span>Explore the highlands <ArrowUpRight size={16} /></span></span>
          </Link>
          <Link className="destination-tile" href="/destinations/bali">
            <Image src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85" alt="Green terraces and tropical landscape in Bali" fill sizes="(max-width: 700px) 100vw, 35vw" />
            <span className="tile-content"><small>INDONESIA · ISLAND DAYS</small><strong>Bali beyond the rush</strong><span>Explore the island <ArrowUpRight size={16} /></span></span>
          </Link>
        </div>
      </section>

      <section className="section packages-section">
        <div className="shell">
          <div className="section-heading">
            <div><p className="eyebrow"><span /> Routes worth imagining</p><h2>Good trips start<br />with <em>good questions.</em></h2></div>
            <p className="section-intro">These sample itineraries help you picture what’s possible. Dates, supplier availability and final prices are confirmed in a written quote.</p>
          </div>
          {demo && <p className="demo-notice"><Sparkles size={16} /> Development sample itineraries — configure MySQL/MariaDB and publish supplier-verified offers before taking bookings.</p>}
          <PackageGrid items={items} />
          <div className="center-action"><Link className="button button-outline" href="/packages">See all sample routes <ArrowUpRight size={16} /></Link></div>
        </div>
      </section>

      <section className="section shell approach-section">
        <div className="approach-image">
          <Image src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=85" alt="Travelers walking through a quiet old-town street" fill sizes="(max-width: 800px) 100vw, 48vw" />
          <span className="image-note"><Compass size={15} /> Travel well, not just far.</span>
        </div>
        <div className="approach-copy"><p className="eyebrow"><span /> A little less guesswork</p><h2>Made for your kind<br />of <em>getting away.</em></h2><p>We start with how you like to travel, not a checkout timer. Tell us what matters and a planner will help map the details before you commit.</p>
          <ul className="benefit-list">
            <li><span><BadgeCheck size={17} /></span><div><strong>A real person, all the way through</strong><small>One travel planner from your first idea to the final itinerary.</small></div></li>
            <li><span><BadgeCheck size={17} /></span><div><strong>Clear quotes before you decide</strong><small>Supplier availability and inclusions confirmed in writing.</small></div></li>
            <li><span><BadgeCheck size={17} /></span><div><strong>Your pace stays yours</strong><small>Room for slower mornings, side streets and plan B.</small></div></li>
          </ul>
          <Link className="text-arrow" href="/about">How we plan <span>→</span></Link>
        </div>
      </section>

      <section className="closing-cta">
        <div className="shell closing-inner"><p className="eyebrow eyebrow-light"><span /> Your idea can start small</p><h2>Tell us what you’re<br /><em>hoping to find.</em></h2><p>No pressure, no instant-book claims. Just a first conversation about the trip you have in mind.</p><Link className="button button-lime" href="/plan-your-trip">Talk to a planner <ArrowUpRight size={17} /></Link></div>
      </section>
    </>
  );
}
