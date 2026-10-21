"use client";

import { useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setIsError(false);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Your message could not be sent.");
      setMessage(`${result.message}${result.emailSent ? " Our travel team was notified." : ""}`);
      form.reset();
    } catch (error) { setIsError(true); setMessage(error instanceof Error ? error.message : "Your message could not be sent."); }
    finally { setBusy(false); }
  }
  return <form className="form-grid contact-form" onSubmit={submit}>
    <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
    <label>Email address<input type="email" name="email" autoComplete="email" maxLength={190} required /></label>
    <label className="field-wide">Subject<input name="subject" minLength={3} maxLength={160} required /></label>
    <label className="field-wide">Message<textarea name="message" rows={5} minLength={5} maxLength={4000} required /></label>
    <label className="honeypot" aria-hidden="true">Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="consent-row field-wide"><input type="checkbox" name="consent" value="true" required /><span>I agree that my details can be used to respond to this message. See the <a href="/privacy">privacy notice</a>.</span></label>
    <button className="button button-dark field-wide" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
    <p className={`form-status field-wide${isError ? " is-error" : ""}`} role="status" aria-live="polite">{message}</p>
  </form>;
}

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(false); setMessage("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Subscription failed.");
      setMessage(result.message); form.reset();
    } catch (reason) { setError(true); setMessage(reason instanceof Error ? reason.message : "Subscription failed."); }
    finally { setBusy(false); }
  }
  return <form className="newsletter-form" onSubmit={submit}>
    <label htmlFor="newsletter-email">Occasional travel notes, no noise</label>
    <div><input id="newsletter-email" name="email" type="email" placeholder="Your email address" autoComplete="email" required maxLength={190} /><button className="button button-lime" disabled={busy}>{busy ? "Joining…" : "Sign me up"}</button></div>
    <label className="newsletter-consent"><input name="consent" type="checkbox" value="true" required />I agree to receive occasional travel emails. Unsubscribe anytime.</label>
    <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <p className={error ? "is-error" : ""} aria-live="polite">{message}</p>
  </form>;
}

export function AdminEnquiryStatus({ item }: {
  item: {
    id: string;
    kind: "enquiry" | "contact";
    status: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string;
    quotedAmountPaise?: number | null;
    adminNotes?: string | null;
  };
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const payload = { ...values, kind: item.kind, quotedAmountRupees: values.quotedAmountRupees || null };
    try {
      const response = await fetch(`/api/admin/enquiries/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save enquiry details.");
      setMessage(result.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save enquiry details."); }
    finally { setBusy(false); }
  }
  return <details className="admin-edit-details"><summary>Manage contact, status and quotation</summary><form className="admin-record-form" onSubmit={update}>
    <input type="hidden" name="id" value={item.id} />
    <label>Status<select name="status" defaultValue={item.status}><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="REPLIED">Replied</option><option value="CLOSED">Closed</option></select></label>
    <label>Name<input name="name" required minLength={2} maxLength={120} defaultValue={item.name} /></label>
    <label>Email<input name="email" type="email" required maxLength={190} defaultValue={item.email} /></label>
    {item.kind === "enquiry" ? <>
      <label>Phone<input name="phone" maxLength={30} defaultValue={item.phone || ""} /></label>
      <label>Written quote (₹)<input name="quotedAmountRupees" type="number" min="0" defaultValue={item.quotedAmountPaise == null ? "" : item.quotedAmountPaise / 100} /></label>
    </> : <label className="field-wide">Subject<input name="subject" required minLength={3} maxLength={160} defaultValue={item.subject || ""} /></label>}
    <label className="field-wide">Private admin notes<textarea name="adminNotes" rows={2} maxLength={4000} defaultValue={item.adminNotes || ""} /></label>
    <button className="button button-outline" disabled={busy}>{busy ? "Saving…" : "Save details"}</button>
    <small role="status">{message}</small>
  </form></details>;
}
