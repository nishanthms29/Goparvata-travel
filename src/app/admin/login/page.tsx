import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/account-forms";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <section className="form-section"><div className="shell account-wrap"><p className="eyebrow"><span /> PRIVATE {brand.name} OPERATIONS</p><h1 className="account-title">Travel desk<br /><em>sign in.</em></h1><p className="page-lede">Administrator access is limited to accounts authorized by the business.</p><AdminLoginForm /><p className="account-links"><Link href="/">Back to the travel website</Link></p></div></section>;
}
