import nodemailer, { type Transporter } from "nodemailer";
import { brand } from "@/lib/brand";

let transport: Transporter | null = null;

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass: password },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transport;
}

export async function sendEnquiryNotice(input: {
  id: string;
  name: string;
  email: string;
  destination: string;
  travellers?: number;
  message: string;
}): Promise<boolean> {
  const mail = getTransport();
  const from = process.env.EMAIL_FROM;
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!mail || !from || !to) return false;

  try {
    await mail.sendMail({
      from,
      to,
      replyTo: { address: input.email, name: input.name },
      subject: `New ${brand.name} travel enquiry ${input.id}`,
      text: [
        `Enquiry reference: ${input.id}`,
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Destination/package: ${input.destination}`,
        input.travellers ? `Travellers: ${input.travellers}` : "",
        "",
        input.message,
      ].filter(Boolean).join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Travel enquiry email delivery failed.", error instanceof Error ? error.message : "Unknown SMTP error");
    return false;
  }
}
