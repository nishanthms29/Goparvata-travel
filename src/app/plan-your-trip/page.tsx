import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = { title: "Plan a custom trip", description: "Tell a Bengaluru travel planner about your dates, destination ideas and budget." };

export default async function PlanYourTripPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const { destination } = await searchParams;
  return <section className="form-section"><div className="shell form-wrap"><p className="eyebrow"><span /> BEGIN WITH AN IDEA</p><h1 className="account-title">Let’s sketch out<br />your <em>next somewhere.</em></h1><p className="page-lede">Share what you know so far. A travel planner can help shape a route and confirm supplier details before you make a decision.</p><div className="demo-banner">This form sends a trip enquiry only. It does not book travel or take payment. Availability and any final price are confirmed separately in writing.</div><EnquiryForm destination={destination || ""} /></div></section>;
}
