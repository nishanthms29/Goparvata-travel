import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/secondary-forms";
import { brand } from "@/lib/brand";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata: Metadata = { title: "Contact", description: `Contact the ${brand.name} travel planning team in Bengaluru.` };

export default function ContactPage() {
  const email = process.env.BUSINESS_EMAIL || "hello@example.com";
  const phone = process.env.BUSINESS_PHONE || "";
  return <><section className="page-hero"><div className="shell"><p className="eyebrow"><span /> A REAL CONVERSATION</p><h1>We’re here for<br />the <em>first question.</em></h1><p>Ask about a trip idea, an existing enquiry or the way we handle your information.</p></div></section><section className="content-section shell contact-layout"><div><p><MapPin size={16} /> Bengaluru, Karnataka, India</p><p><Mail size={16} /> <a href={`mailto:${email}`}>{email}</a></p>{phone && <p><Phone size={16} /><a href={`tel:${phone}`}>{phone}</a></p>}<p><WhatsAppLink className="button button-outline">Chat with us on WhatsApp ↗</WhatsAppLink></p><div className="demo-banner">Business address, registration details and customer support hours should be verified and configured before public launch.</div></div><ContactForm /></section></>;
}
