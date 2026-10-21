import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { BookingAdminControls, PackageEditForm, PackagePublishControl, WhatsAppSettingsForm } from "@/components/admin-forms";
import { AdminEnquiryStatus } from "@/components/secondary-forms";
import { db } from "@/lib/db";
import { formatInr } from "@/lib/pricing";

export const metadata: Metadata = { title: "Admin operations", robots: { index: false, follow: false } };

const allowedSections = ["packages", "bookings", "enquiries", "payments", "refunds", "reviews", "blog", "coupons", "settings"];

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/");
  const account = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (account?.role !== "ADMIN") redirect("/");
  const { section } = await params;
  if (!allowedSections.includes(section)) notFound();

  return <section className="admin-shell shell"><p className="eyebrow"><span /> PRIVATE OPERATIONS</p><div className="admin-heading"><div><h1>{section.charAt(0).toUpperCase() + section.slice(1)}.</h1><p>Administrator workspace. Customer data is available only to authorized travel staff.</p></div><div className="admin-heading-actions"><Link className="button button-outline" href="/admin">← Dashboard</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="button button-outline">Sign out</button></form></div></div><AdminContent section={section} /></section>;
}

async function AdminContent({ section }: { section: string }) {
  if (section === "enquiries") {
    const [items, contacts] = await Promise.all([
      db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
    return <><p className="admin-toolbar"><span>{items.length} trip enquiries · {contacts.length} contact messages</span><Link className="button button-outline" href="/api/admin/enquiries/csv">Export trip enquiries</Link></p><h2 className="admin-section-title">Trip enquiries</h2>{items.length ? <div className="admin-list">{items.map((item) => <article key={item.id}><div><small>{item.createdAt.toLocaleString("en-IN")} · {item.id}</small><h2>{item.name} · {item.destination || item.packageSlug || "Custom trip"}</h2><p><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <> · <a href={`tel:${item.phone}`}>{item.phone}</a></>} · {item.travellers ?? "?"} traveller(s)</p><p>{item.message}</p><p>{item.quotedAmountPaise === null ? "No written quote saved" : `Written quote: ${formatInr(item.quotedAmountPaise)}`}</p></div><AdminEnquiryStatus item={{ id: item.id, kind: "enquiry", status: item.status, name: item.name, email: item.email, phone: item.phone, quotedAmountPaise: item.quotedAmountPaise, adminNotes: item.adminNotes }} /></article>)}</div> : <p className="muted-copy">No trip enquiries yet.</p>}<h2 className="admin-section-title">Contact messages</h2>{contacts.length ? <div className="admin-list">{contacts.map((item) => <article key={item.id}><div><small>{item.createdAt.toLocaleString("en-IN")} · {item.id}</small><h2>{item.name} · {item.subject}</h2><p><a href={`mailto:${item.email}`}>{item.email}</a></p><p>{item.message}</p></div><AdminEnquiryStatus item={{ id: item.id, kind: "contact", status: item.status, name: item.name, email: item.email, subject: item.subject, adminNotes: item.adminNotes }} /></article>)}</div> : <p className="muted-copy">No contact messages yet.</p>}</>;
  }
  if (section === "packages") {
    const [items, destinations] = await Promise.all([
      db.tourPackage.findMany({ include: { destination: { select: { name: true, slug: true, imageUrl: true } }, images: { select: { url: true }, orderBy: { displayOrder: "asc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 }),
      db.destination.findMany({ where: { published: true }, select: { name: true, slug: true, imageUrl: true }, orderBy: { name: "asc" } }),
    ]);
    return <><p className="admin-warning">A sample planning rate is not a supplier quote. Mark an offer live only after availability and commercial terms are verified with suppliers. Archiving a package hides it from visitors while preserving its booking history.</p><div className="admin-list">{items.map((item) => <article key={item.id}><div><small>{item.destination.name} · {item.category.toLowerCase()} · {item.days} days</small><h2>{item.name}</h2><p>{item.slug} · {formatInr(item.adultPricePaise)} per adult · {item.sampleOffer ? "Sample estimate" : "Verified offer"} · {item.status.toLowerCase()}</p><p>{item.shortDescription}</p><PackageEditForm slug={item.slug} destinations={destinations} item={{ name: item.name, destinationSlug: item.destination.slug, category: item.category, shortDescription: item.shortDescription, description: item.description, days: item.days, nights: item.nights, adultPricePaise: item.adultPricePaise, childPricePaise: item.childPricePaise, imageUrl: item.images[0]?.url || item.destination.imageUrl || "", sampleOffer: item.sampleOffer }} /></div><PackagePublishControl slug={item.slug} status={item.status} /></article>)}</div><PackageForm destinations={destinations} /></>;
  }
  if (section === "bookings") {
    const items = await db.booking.findMany({ include: { package: { select: { name: true } }, payments: { select: { status: true, amountPaise: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
    return items.length ? <div className="admin-list">{items.map((item) => <article key={item.id}><div><small>{item.createdAt.toLocaleString("en-IN")} · {item.reference}</small><h2>{item.contactName} · {item.package.name}</h2><p><a href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a> · <a href={`tel:${item.contactPhone}`}>{item.contactPhone}</a> · {item.adults + item.children} traveller(s)</p><p>Planning estimate: {formatInr(item.totalPaise)} · {item.payments.length ? "Historical payment records exist" : "No payment"}</p>{item.quotedAmountPaise !== null && <p>Written quote: {formatInr(item.quotedAmountPaise)}</p>}</div><BookingAdminControls item={{ id: item.id, status: item.status, contactName: item.contactName, contactEmail: item.contactEmail, contactPhone: item.contactPhone, quotedAmountPaise: item.quotedAmountPaise, adminNotes: item.adminNotes }} /></article>)}</div> : <p className="muted-copy">No trip requests have been received.</p>;
  }
  if (section === "payments") {
    const items = await db.payment.findMany({ include: { booking: { select: { reference: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
    return items.length ? <div className="table-wrap"><table><thead><tr><th>Created</th><th>Order</th><th>Booking</th><th>Status</th><th>Amount</th><th>Signature</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.createdAt.toLocaleString("en-IN")}</td><td>{item.orderId || "—"}</td><td>{item.booking?.reference || "—"}</td><td>{item.status.toLowerCase()}</td><td>{formatInr(item.amountPaise)}</td><td>{item.signatureVerifiedAt ? "Verified" : "Not verified"}</td></tr>)}</tbody></table></div> : <p className="muted-copy">No payment attempts recorded.</p>;
  }
  if (section === "refunds") {
    const items = await db.refund.findMany({ include: { booking: { select: { reference: true, contactName: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
    return items.length ? <div className="table-wrap"><table><thead><tr><th>Created</th><th>Booking</th><th>Status</th><th>Amount</th><th>Reason</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.createdAt.toLocaleDateString("en-IN")}</td><td>{item.booking.reference} · {item.booking.contactName}</td><td>{item.status.toLowerCase()}</td><td>{formatInr(item.amountPaise)}</td><td>{item.reason || "—"}</td></tr>)}</tbody></table></div> : <p className="muted-copy">No refunds recorded.</p>;
  }
  if (section === "reviews") {
    const items = await db.review.findMany({ include: { user: { select: { name: true } }, package: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
    return items.length ? <div className="admin-list">{items.map((item) => <article key={item.id}><div><small>{item.createdAt.toLocaleDateString("en-IN")} · {item.rating}/5 · {item.published ? "Published" : "Pending"}</small><h2>{item.title || item.package.name}</h2><p>{item.user.name} · {item.package.name}</p><p>{item.body}</p></div></article>)}</div> : <p className="muted-copy">No reviews submitted yet.</p>;
  }
  if (section === "blog") {
    const items = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
    return items.length ? <div className="admin-list">{items.map((item) => <article key={item.id}><div><small>{item.status.toLowerCase()} · {item.updatedAt.toLocaleDateString("en-IN")}</small><h2>{item.title}</h2><p>{item.excerpt}</p></div><Link href={`/blog/${item.slug}`}>Preview →</Link></article>)}</div> : <p className="muted-copy">No articles saved yet. Public guide pages are clearly marked editorial examples.</p>;
  }
  if (section === "coupons") {
    const items = await db.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return items.length ? <div className="table-wrap"><table><thead><tr><th>Code</th><th>Discount</th><th>Minimum</th><th>Use</th><th>Active</th><th>Expires</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.percentOff ? `${item.percentOff}%` : formatInr(item.amountOffPaise ?? 0)}</td><td>{formatInr(item.minimumPaise)}</td><td>{item.usedCount}{item.usageLimit ? ` / ${item.usageLimit}` : ""}</td><td>{item.active ? "Yes" : "No"}</td><td>{item.expiresAt?.toLocaleDateString("en-IN") || "—"}</td></tr>)}</tbody></table></div> : <p className="muted-copy">No coupons configured.</p>;
  }
  if (section === "settings") {
    const items = await db.websiteSetting.findMany({ orderBy: { key: "asc" } });
    const whatsappSetting = items.find((item) => item.key === "whatsappBusinessNumber");
    const whatsappNumber = whatsappSetting
      ? typeof whatsappSetting.value === "string" ? whatsappSetting.value.replace(/\D/g, "").slice(0, 15) : ""
      : process.env.WHATSAPP_BUSINESS_NUMBER || "";
    return <><p className="admin-warning">Confirm legal identity, GST/tax treatment and business contact details with a qualified Indian professional before going live.</p><WhatsAppSettingsForm initialNumber={whatsappNumber} />{items.length > 0 && <div className="admin-list">{items.filter((item) => item.key !== "whatsappBusinessNumber").map((item) => <article key={item.key}><div><small>{item.key}</small><h2>{JSON.stringify(item.value)}</h2></div></article>)}</div>}</>;
  }
  return notFound();
}

function PackageForm({ destinations }: { destinations: { name: string; slug: string }[] }) {
  return <div className="admin-create-panel"><p className="eyebrow"><span /> NEW ROUTE</p>{destinations.length ? <PackageAdminFormWrapper destinations={destinations} /> : <p className="muted-copy">Publish a destination before creating packages.</p>}</div>;
}

import { PackageAdminForm as PackageAdminFormWrapper } from "@/components/admin-forms";
