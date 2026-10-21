import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = { title: "Travel consultation" };
export default function ConsultationPage() {
  return <section className="form-section"><div className="shell form-wrap"><p className="eyebrow"><span /> A CONVERSATION BEFORE THE ITINERARY</p><h1 className="account-title">Bring the questions<br />you <em>already have.</em></h1><p className="page-lede">Ask about pacing, route ideas or what still needs confirming. A consultation request is an enquiry, not a paid appointment or travel booking.</p><EnquiryForm title="Ask for a planning conversation" submitLabel="Request a conversation" /></div></section>;
}
