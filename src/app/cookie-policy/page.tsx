import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
export const metadata: Metadata = { title: "Cookie notice" };
export default function CookiePolicyPage() { return <InfoPage eyebrow="LEGAL TEMPLATE · REVIEW BEFORE USE" title={<>A simple note<br />about <em>cookies.</em></>} intro="Update this notice to match the cookies, authentication sessions, analytics and third-party scripts actually enabled in production." sections={[
  { title: "Essential session cookies", body: "Authentication may use an encrypted, HTTP-only session cookie so the account and admin areas work. Do not disable essential session security controls." },
  { title: "Optional analytics", body: "No analytics or advertising cookies should be enabled without a documented purpose, accurate notice and any consent required for the actual deployment." },
  { title: "Control and deletion", body: "Browser settings can delete or block cookies, but sign-in and account functions may stop working. Revisit this notice if any new third-party tools are added." },
]} action={false} />; }
