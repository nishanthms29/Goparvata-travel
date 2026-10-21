import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Frequently asked questions" };
export default function FAQPage() {
  return <InfoPage title={<>A few helpful<br /><em>answers.</em></>} intro="If your question depends on dates, destinations or suppliers, send us a message and we’ll help clarify what needs checking." sections={[
    { title: "Are the website prices final?", body: "No. Sample prices are planning estimates, not offers. Final prices, taxes, inclusions, supplier availability and cancellation terms require written confirmation." },
    { title: "Does this website book flights or hotels instantly?", body: "No. It currently supports enquiry-first planning. It has no live airline or hotel inventory and does not confirm a reservation." },
    { title: "When is a trip confirmed?", body: "Only after the supplier confirms availability, you receive the written itinerary and terms, and the agreed payment process has been completed. An enquiry or payment-screen message alone is not proof of supplier reservation." },
    { title: "Can I request a custom route?", body: "Yes. Use the custom trip form and include your destination ideas, travel month, group size, preferences and approximate budget." },
    { title: "What happens if I cancel?", body: "Cancellation terms depend on the final confirmed suppliers and itinerary. The website policy is a template; the written terms for your trip will govern and should be reviewed before payment." },
    { title: "Do I need a visa or travel insurance?", body: "Entry requirements and insurance needs depend on your nationality, destination and circumstances. Verify current official guidance and suitable coverage independently." },
  ]} />;
}
