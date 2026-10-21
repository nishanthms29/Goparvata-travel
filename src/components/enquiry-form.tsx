"use client";

import { useState } from "react";
import { brand } from "@/lib/brand";

type Props = {
  title?: string;
  destination?: string;
  packageSlug?: string;
  submitLabel?: string;
};

export function EnquiryForm({ title = "Tell us what you have in mind", destination = "", packageSlug = "", submitLabel = "Send trip enquiry" }: Props) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    setStatus("");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We could not send your request.");
      setStatus(`Request received. Reference ${result.reference}. ${result.emailSent ? "A planner notification was sent." : "We’ll follow up using the contact details you provided."}`);
      form.reset();
    } catch (reason) {
      setError(true);
      setStatus(reason instanceof Error ? reason.message : "Unable to send your request right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid enquiry-form" onSubmit={submit}>
      <h2>{title}</h2>
      <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
      <label>Email address<input name="email" type="email" autoComplete="email" maxLength={190} required /></label>
      <label>Phone number <span className="optional-label">optional</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} /></label>
      <label>Destination<input name="destination" defaultValue={destination} placeholder="Where would you like to go?" maxLength={100} /></label>
      <label>Travellers<input name="travellers" type="number" min="1" max="20" defaultValue="2" /></label>
      <label>When would you like to travel?<input name="travelMonth" type="month" /></label>
      <label className="field-wide">Tell us a little about the trip<textarea name="message" rows={4} minLength={5} maxLength={2000} placeholder="Dates, preferences, questions or anything else we should know" required /></label>
      <input type="hidden" name="packageSlug" value={packageSlug} />
      <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="consent-row field-wide"><input name="consent" type="checkbox" value="true" required /><span>I agree that {brand.name} may use these details to respond to my enquiry. Read our <a href="/privacy">privacy notice</a>.</span></label>
      <button className="button button-dark field-wide" type="submit" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
      <p className={`form-status field-wide${error ? " is-error" : ""}`} aria-live="polite">{status}</p>
    </form>
  );
}
