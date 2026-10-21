import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
export const metadata: Metadata = { title: "Corporate travel enquiries" };
export default function CorporateTravelPage() { return <section className="form-section"><div className="shell form-wrap"><p className="eyebrow"><span /> BUSINESS TRAVEL ENQUIRY</p><h1 className="account-title">Work trips,<br /><em>thoughtfully planned.</em></h1><p className="page-lede">Share your organisation’s travel-planning needs. This form starts a conversation; it does not issue corporate rates or confirm reservations.</p><EnquiryForm title="Tell us about your travel needs" submitLabel="Send corporate enquiry" /></div></section>; }
