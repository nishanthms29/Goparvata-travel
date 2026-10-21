import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppLink } from "@/components/whatsapp-link";

const legalLinks = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Cancellation", "/cancellation-policy"],
  ["Cookies", "/cookie-policy"],
];

export function SiteFooter() {
  const email = process.env.BUSINESS_EMAIL || "20shreyas@gmail.com";
  const phone = process.env.BUSINESS_PHONE || "";
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark"><span aria-hidden="true">↗</span></span>
            <span className="brand-type"><strong>{brand.name}</strong><small>{brand.tagline}</small></span>
          </Link>
          <p>Personal travel planning from Bengaluru. Real itineraries, clear conversations, and room to travel at your own pace.</p>
          <span className="footer-location"><MapPin size={15} /> Bengaluru, Karnataka, India</span>
        </div>
        <div><h2>Explore</h2><Link href="/destinations">Destinations</Link><Link href="/packages">Tour packages</Link><Link href="/plan-your-trip">Custom trip planner</Link><Link href="/faq">FAQs</Link></div>
        <div><h2>Get in touch</h2><a href={`mailto:${email}`}><Mail size={15} />{email}</a>{phone && <a href={`tel:${phone}`}><Phone size={15} />{phone}</a>}<WhatsAppLink>WhatsApp planner ↗</WhatsAppLink><Link href="/contact">Contact us</Link></div>
        <div><h2>Follow the journey</h2><Link href="/blog">Travel notes</Link><a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a><Link href="/reviews">Guest feedback</Link></div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} {brand.name}. {brand.tagline} Sample itineraries and prices are planning estimates, not confirmed offers.</p>
        <div>{legalLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </div>
    </footer>
  );
}
