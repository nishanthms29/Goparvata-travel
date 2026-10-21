import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
export const metadata: Metadata = { title: "Privacy notice" };
export default function PrivacyPage() { return <InfoPage eyebrow="LEGAL TEMPLATE · REVIEW BEFORE USE" title={<>Your details,<br /><em>handled carefully.</em></>} intro="This starter privacy notice requires a real data-controller identity, contact point, retention schedule and legal review before it is used for customers." sections={[
  { title: "Information collected", body: "The application may collect account name and email, contact details, trip preferences, enquiry messages, booking records, payment-provider references, technical and security logs, and newsletter preferences that you choose to submit." },
  { title: "Why it is used", body: "Information is used to create accounts, answer enquiries, prepare quotations, manage bookings, secure the service, respond to support requests and send opted-in newsletter messages." },
  { title: "Sharing and processors", body: "Where configured, necessary data may be processed by hosting, database, authentication, SMTP, payment and analytics providers. Review their contracts, location, security and retention settings before production use." },
  { title: "Retention and requests", body: "The operator must publish accurate retention periods and a verified contact for access, correction, deletion, consent withdrawal and complaints. Set these before collecting real customer data." },
  { title: "Security and incident response", body: "No online system can promise zero risk. Configure least privilege, backups, access review, encryption, logging and a documented incident-response process." },
]} action={false} />; }
