import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
export const metadata: Metadata = { title: "Terms & conditions" };
export default function TermsPage() { return <InfoPage eyebrow="LEGAL TEMPLATE · REVIEW BEFORE USE" title={<>Terms of<br /><em>website use.</em></>} intro="This editable starter template is not legal advice and must be reviewed by a qualified Indian legal professional before the business relies on it." sections={[
  { title: "Website and enquiry use", body: "Website descriptions and prices may be sample planning information. Submitting a form is a request for information only; it does not form a travel contract or reserve a supplier service." },
  { title: "Written travel agreement", body: "Any actual service, supplier, price, tax, payment schedule, cancellation rule, responsibility and dispute process must be set out in a separate written agreement appropriate to the transaction." },
  { title: "Business and consumer compliance", body: "The business owner must confirm its legal identity, applicable consumer protection obligations, GST treatment, registrations, and dispute-resolution terms with qualified Indian professionals." },
]} action={false} />; }
