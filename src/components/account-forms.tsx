"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function StatusMessage({ message, error }: { message: string; error: boolean }) {
  return message ? <p className={`form-status${error ? " is-error" : ""}`} role="status" aria-live="polite">{message}</p> : null;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(false); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(data.get("email")),
        password: String(data.get("password")),
        redirect: false,
        callbackUrl: "/admin",
      });
      if (!result || result.error) throw new Error("Email or password was not recognized.");
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(true); setMessage(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally { setBusy(false); }
  }
  return <form className="form-grid account-form" onSubmit={submit}><label className="field-wide">Administrator email<input type="email" name="email" autoComplete="username" required maxLength={190} /></label><label className="field-wide">Password<input type="password" name="password" autoComplete="current-password" required maxLength={128} /></label><button className="button button-dark field-wide" disabled={busy}>{busy ? "Signing in…" : "Sign in to the admin desk"}</button><StatusMessage message={message} error={error} /></form>;
}
