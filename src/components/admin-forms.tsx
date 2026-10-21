"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PackageAdminForm({ destinations }: { destinations: { name: string; slug: string }[] }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const payload = {
      ...values,
      published: formData.has("published"),
      sampleOffer: formData.has("sampleOffer"),
    };
    try {
      const response = await fetch("/api/admin/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not create package.");
      setMessage(result.message);
      form.reset();
      window.location.reload();
    } catch (reason) { setError(true); setMessage(reason instanceof Error ? reason.message : "Could not create package."); }
    finally { setBusy(false); }
  }
  return <form className="form-grid admin-form" onSubmit={submit}>
    <h2>Create package</h2>
    <label>Package name<input name="name" required minLength={2} maxLength={160} /></label>
    <label>URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} placeholder="kerala-coast-route" /></label>
    <label>Destination<select name="destinationSlug" required defaultValue=""><option value="" disabled>Select destination</option>{destinations.map((destination) => <option key={destination.slug} value={destination.slug}>{destination.name}</option>)}</select></label>
    <label>Category<select name="category" defaultValue="DOMESTIC"><option value="DOMESTIC">Domestic</option><option value="INTERNATIONAL">International</option><option value="ADVENTURE">Adventure</option><option value="HONEYMOON">Honeymoon</option><option value="FAMILY">Family</option><option value="GROUP">Group</option><option value="CORPORATE">Corporate</option></select></label>
    <label>Days<input name="days" type="number" min="1" max="60" required defaultValue="5" /></label>
    <label>Nights<input name="nights" type="number" min="0" max="59" required defaultValue="4" /></label>
    <label>Adult estimate (₹)<input name="adultPriceRupees" type="number" min="1" required /></label>
    <label>Child estimate (₹)<input name="childPriceRupees" type="number" min="0" /></label>
    <label className="field-wide">Photo URL (HTTPS)<input name="imageUrl" type="url" placeholder="https://…" required /></label>
    <label className="field-wide">Short introduction<textarea name="shortDescription" rows={2} minLength={10} maxLength={320} required /></label>
    <label className="field-wide">Detailed trip description<textarea name="description" rows={4} minLength={20} maxLength={10000} required /></label>
    <label className="check-row"><input type="checkbox" name="published" /> Publish immediately</label>
    <label className="check-row"><input type="checkbox" name="sampleOffer" defaultChecked /> Clearly mark as sample planning estimate</label>
    <button className="button button-dark field-wide" disabled={busy}>{busy ? "Saving…" : "Create package"}</button>
    <p className={`form-status field-wide${error ? " is-error" : ""}`} role="status">{message}</p>
  </form>;
}

export function PackagePublishControl({ slug, status }: { slug: string; status: string }) {
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/packages/${encodeURIComponent(slug)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update package.");
      setMessage("Saved");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update."); }
    finally { setBusy(false); }
  }
  return <div className="admin-status-control"><select aria-label={`Status for ${slug}`} value={value} onChange={(event) => setValue(event.target.value)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select><button className="button button-outline" type="button" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button><small role="status">{message}</small></div>;
}

export function PackageEditForm({ slug, destinations, item }: {
  slug: string;
  destinations: { name: string; slug: string }[];
  item: {
    name: string;
    destinationSlug: string;
    category: string;
    shortDescription: string;
    description: string;
    days: number;
    nights: number;
    adultPricePaise: number;
    childPricePaise: number | null;
    imageUrl: string;
    sampleOffer: boolean;
  };
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      sampleOffer: formData.has("sampleOffer"),
    };
    try {
      const response = await fetch(`/api/admin/packages/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update package.");
      setMessage(result.message);
      window.location.reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not update package.");
    } finally {
      setBusy(false);
    }
  }

  return <details className="admin-edit-details">
    <summary>Edit package details</summary>
    <form className="form-grid admin-form" onSubmit={submit}>
      <label>Package name<input name="name" required minLength={2} maxLength={160} defaultValue={item.name} /></label>
      <label>Destination<select name="destinationSlug" required defaultValue={item.destinationSlug}>{destinations.map((destination) => <option key={destination.slug} value={destination.slug}>{destination.name}</option>)}</select></label>
      <label>Category<select name="category" required defaultValue={item.category}><option value="DOMESTIC">Domestic</option><option value="INTERNATIONAL">International</option><option value="ADVENTURE">Adventure</option><option value="HONEYMOON">Honeymoon</option><option value="FAMILY">Family</option><option value="GROUP">Group</option><option value="CORPORATE">Corporate</option></select></label>
      <label>Days<input name="days" type="number" min="1" max="60" required defaultValue={item.days} /></label>
      <label>Nights<input name="nights" type="number" min="0" max="59" required defaultValue={item.nights} /></label>
      <label>Adult estimate (₹)<input name="adultPriceRupees" type="number" min="1" required defaultValue={item.adultPricePaise / 100} /></label>
      <label>Child estimate (₹)<input name="childPriceRupees" type="number" min="0" defaultValue={item.childPricePaise === null ? "" : item.childPricePaise / 100} /></label>
      <label className="field-wide">Photo URL (HTTPS)<input name="imageUrl" type="url" required defaultValue={item.imageUrl} /></label>
      <label className="field-wide">Short introduction<textarea name="shortDescription" rows={2} minLength={10} maxLength={320} required defaultValue={item.shortDescription} /></label>
      <label className="field-wide">Detailed trip description<textarea name="description" rows={4} minLength={20} maxLength={10000} required defaultValue={item.description} /></label>
      <label className="check-row"><input type="checkbox" name="sampleOffer" defaultChecked={item.sampleOffer} /> Sample planning estimate</label>
      <button className="button button-dark field-wide" disabled={busy}>{busy ? "Saving…" : "Save package details"}</button>
      <p className="form-status field-wide" role="status">{message}</p>
    </form>
  </details>;
}

export function BookingAdminControls({ item }: {
  item: {
    id: string;
    status: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    quotedAmountPaise: number | null;
    adminNotes: string | null;
  };
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, quotedAmountRupees: values.quotedAmountRupees || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update trip request.");
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update trip request.");
    } finally {
      setBusy(false);
    }
  }
  return <form className="admin-record-form" onSubmit={submit}>
    <input type="hidden" name="id" value={item.id} />
    <label>Status<select name="status" defaultValue={item.status}><option value="ENQUIRY">Enquiry</option><option value="CONFIRMED">Confirmed directly</option><option value="CANCELLED">Cancelled</option></select></label>
    <label>Name<input name="contactName" required minLength={2} maxLength={120} defaultValue={item.contactName} /></label>
    <label>Email<input name="contactEmail" type="email" required maxLength={190} defaultValue={item.contactEmail} /></label>
    <label>Phone<input name="contactPhone" required minLength={7} maxLength={30} defaultValue={item.contactPhone} /></label>
    <label>Written quote (₹)<input name="quotedAmountRupees" type="number" min="0" defaultValue={item.quotedAmountPaise === null ? "" : item.quotedAmountPaise / 100} /></label>
    <label className="field-wide">Private admin notes<textarea name="adminNotes" rows={2} maxLength={4000} defaultValue={item.adminNotes || ""} /></label>
    <button className="button button-outline" disabled={busy}>{busy ? "Saving…" : "Save request"}</button>
    <small role="status">{message}</small>
  </form>;
}

export function WhatsAppSettingsForm({ initialNumber }: { initialNumber: string }) {
  const router = useRouter();
  const [number, setNumber] = useState(initialNumber);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappBusinessNumber: number }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update WhatsApp contact.");
      setMessage(result.message);
      router.refresh();
    } catch (reason) {
      setError(true);
      setMessage(reason instanceof Error ? reason.message : "Could not update WhatsApp contact.");
    } finally {
      setBusy(false);
    }
  }
  return <form className="form-grid admin-form" onSubmit={submit}>
    <h2>WhatsApp contact</h2>
    <p className="field-wide muted-copy">Enter the business number with country code, digits only. Leave blank to hide WhatsApp links from visitors.</p>
    <label className="field-wide">Business WhatsApp number
      <input type="tel" inputMode="numeric" autoComplete="tel" value={number} onChange={(event) => setNumber(event.target.value)} placeholder="919876543210" maxLength={16} />
    </label>
    <button className="button button-dark field-wide" disabled={busy}>{busy ? "Saving…" : "Save WhatsApp number"}</button>
    <p className={`form-status field-wide${error ? " is-error" : ""}`} role="status" aria-live="polite">{message}</p>
  </form>;
}
