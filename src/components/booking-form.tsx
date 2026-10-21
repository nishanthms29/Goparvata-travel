"use client";

import { useState } from "react";
import { brand } from "@/lib/brand";

export function BookingForm({ slug, adultPricePaise, childPricePaise }: { slug: string; adultPricePaise: number; childPricePaise: number | null }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setReference(""); setError(false);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Booking request failed.");
      setReference(result.reference);
      setMessage("Your quotation request has been saved. This is not a reservation and no payment has been taken.");
      event.currentTarget.reset();
    } catch (reason) {
      setError(true); setMessage(reason instanceof Error ? reason.message : "Booking request failed.");
    } finally { setBusy(false); }
  }
  const childPrice = childPricePaise ?? adultPricePaise;
  return <form className="form-grid enquiry-form" onSubmit={submit}>
    <h2>Request this trip</h2>
    <p className="field-wide booking-estimate">Sample estimate: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(adultPricePaise / 100)} per adult{childPricePaise !== null ? ` · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(childPrice / 100)} per child` : ""}. Final pricing must be confirmed in a written quote.</p>
    <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
    <label>Email<input name="email" type="email" autoComplete="email" maxLength={190} required /></label>
    <label>Phone<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required /></label>
    <label>Adults<input name="adults" type="number" min="1" max="20" defaultValue="2" required /></label>
    <label>Children<input name="children" type="number" min="0" max="20" defaultValue="0" required /></label>
    <input type="hidden" name="packageSlug" value={slug} />
    <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="consent-row field-wide"><input type="checkbox" name="consent" value="true" required /><span>I agree that {brand.name} can use my details to respond to this quote request. See our <a href="/privacy">privacy notice</a>.</span></label>
    <button className="button button-dark field-wide" disabled={busy}>{busy ? "Sending request…" : "Request a written quote"}</button>
    <p className={`form-status field-wide${error ? " is-error" : ""}`} role="status" aria-live="polite">{message} {reference && <strong>Reference: {reference}</strong>}</p>
  </form>;
}
