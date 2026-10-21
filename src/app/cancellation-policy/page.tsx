import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
export const metadata: Metadata = { title: "Cancellation & refund policy" };
export default function CancellationPage() { return <InfoPage eyebrow="LEGAL TEMPLATE · REVIEW BEFORE USE" title={<>Changes happen.<br /><em>Know the terms.</em></>} intro="This page is a placeholder template, not a promise of a refund or cancellation right. Supplier and local legal terms must be confirmed before publication." sections={[
  { title: "Before confirmation", body: "An enquiry or quotation request is not a booking. Do not pay until you have received and accepted the written itinerary, named suppliers, payment schedule, cancellation fees and applicable terms." },
  { title: "After confirmation", body: "Cancellation, rescheduling and refund amounts depend on the supplier contracts, timing, services already delivered, any non-refundable charges and applicable law. The written agreement for the trip must explain how to request a change and how the amount is calculated." },
  { title: "Refund processing", body: "Where a refund is due, the operator should document the amount, payment channel and expected processing time. Payment gateway records alone do not determine whether a refund is owed." },
]} action={false} />; }
