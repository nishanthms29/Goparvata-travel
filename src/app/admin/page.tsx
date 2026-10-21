import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, CreditCard, MessageCircle, Package } from "lucide-react";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { formatInr } from "@/lib/pricing";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

const sections = [
  ["packages", "Packages & destinations", Package, "Manage itineraries and publish status"],
  ["bookings", "Trip requests & quotes", CreditCard, "Manage contact details, written quotes and request status"],
  ["enquiries", "Enquiries & messages", MessageCircle, "Respond to trip and contact requests"],
  ["reviews", "Reviews", MessageCircle, "Moderate customer feedback"],
  ["blog", "Travel guides", Package, "Review published editorial content"],
  ["coupons", "Coupons", CreditCard, "Manage discount rules"],
  ["settings", "Website settings", CalendarDays, "View business and site configuration"],
];

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/");
  const account = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (account?.role !== "ADMIN") redirect("/");
  const [bookings, enquiries, payments, refunds, packages, recentBookings] = await Promise.all([
    db.booking.count(),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.payment.aggregate({ where: { status: "CAPTURED" }, _sum: { amountPaise: true }, _count: true }),
    db.refund.aggregate({ where: { status: { in: ["PROCESSED", "COMPLETED"] } }, _sum: { amountPaise: true } }),
    db.tourPackage.count({ where: { status: "PUBLISHED" } }),
    db.booking.findMany({ include: { package: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return <section className="admin-shell shell">
    <p className="eyebrow"><span /> {brand.name} · PRIVATE OPERATIONS</p><div className="admin-heading"><div><h1>Travel desk.</h1><p>Signed in as {session.user.name || session.user.email}. Manage enquiries and written quotations; arrangements are confirmed directly with travellers.</p></div><div className="admin-heading-actions"><Link className="button button-outline" href="/">View public site <ArrowUpRight size={15} /></Link><form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="button button-outline">Sign out</button></form></div></div>
    <div className="admin-stats">
      <article><span>Total trip requests</span><strong>{bookings}</strong><small>Sample and confirmed requests</small></article>
      <article><span>New enquiries</span><strong>{enquiries}</strong><small>Awaiting first review</small></article>
      <article><span>Live published offers</span><strong>{packages}</strong><small>Verify availability before promoting</small></article>
      <article><span>Captured payments</span><strong>{payments._count}</strong><small>{formatInr(payments._sum.amountPaise ?? 0)} verified</small></article>
      <article><span>Processed refunds</span><strong>{formatInr(refunds._sum.amountPaise ?? 0)}</strong><small>Recorded refunds</small></article>
    </div>
    <h2 className="admin-section-title">Operations</h2>
    <div className="admin-link-grid">{sections.map(([slug, title, Icon, description]) => <Link href={`/admin/${slug}`} key={String(slug)}><Icon size={19} /><span><strong>{String(title)}</strong><small>{String(description)}</small></span><ArrowUpRight size={15} /></Link>)}</div>
    <h2 className="admin-section-title">Recent requests</h2>
    {recentBookings.length ? <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Package</th><th>Status</th><th>Amount estimate</th><th>Created</th></tr></thead><tbody>{recentBookings.map((booking) => <tr key={booking.id}><td>{booking.reference}</td><td>{booking.package.name}</td><td>{booking.status.replaceAll("_", " ").toLowerCase()}</td><td>{formatInr(booking.totalPaise)}</td><td>{booking.createdAt.toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div> : <p className="muted-copy">No requests have been received yet.</p>}
    <p className="admin-warning">Payments and supplier reservations are not enabled for sample planning packages. The amount above includes only verified captured transactions; estimates are not revenue.</p>
  </section>;
}
