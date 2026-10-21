import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
export const metadata: Metadata = { title: "Booking conditions" };
export default function BookingConditionsPage() { return <InfoPage eyebrow="LEGAL TEMPLATE · REVIEW BEFORE USE" title={<>Before any<br /><em>booking is made.</em></>} intro="This application is enquiry-first. A trip is not booked merely because a quote request is submitted or a payment interface is opened." sections={[
  { title: "Supplier confirmation", body: "Every supplier, travel date, passenger name, room category, transfer, inclusion and restriction must be checked and confirmed before describing a trip as reserved." },
  { title: "Price and payment", body: "A final price and any applicable taxes or service fees must be itemized in writing. Online payments should only be enabled for a verified supplier offer and a valid departure with capacity." },
  { title: "Identity, visas and insurance", body: "Travellers remain responsible for valid travel documents and should independently verify current official entry, health and safety guidance. Insurance needs must be considered before travel." },
]} action={false} />; }
