import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "About us", description: `Learn about ${brand.name}, your adventurous travel-planning team in India.` };

export default function AboutPage() {
  return <InfoPage eyebrow="INDIAN WILDERNESS, WIDE OPEN" title={<>Find your wild.<br /><em>Follow your wonder.</em></>} intro={`${brand.name} plans adventurous journeys through India and beyond, with thoughtful routes, clear quotes, and a real person to help you travel with confidence.`} sections={[
    { title: "Start with the traveller", body: "We begin by asking how you like to travel: the pace, the people, the things you want to notice. Sample itineraries on this website are ideas to discuss, not a claim of confirmed inventory." },
    { title: "Clear before commitment", body: "Supplier availability, inclusions, dates, cancellation terms and final pricing must be confirmed in a written quotation before a reservation or payment. No flight or hotel booking is made by browsing this website." },
    { title: "A Bengaluru starting point", body: "The project is based in Bengaluru, Karnataka. Registered business details, tax treatment, licences, insurance and applicable consumer terms must be confirmed by the business owner with qualified Indian professionals before launch." },
  ]} />;
}
