"use client";

import { useEffect, useState } from "react";

export function WhatsAppLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const [number, setNumber] = useState("");

  useEffect(() => {
    fetch("/api/contact-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Contact settings returned ${response.status}.`);
        return response.json() as Promise<{ whatsappBusinessNumber: string }>;
      })
      .then((settings) => setNumber(settings.whatsappBusinessNumber))
      .catch((error: unknown) => {
        console.error("Could not load WhatsApp contact link.", error instanceof Error ? error.message : "Unknown server error");
      });
  }, []);

  if (!number) return null;
  return <a className={className} href={`https://wa.me/${number}`} target="_blank" rel="noreferrer">{children}</a>;
}
