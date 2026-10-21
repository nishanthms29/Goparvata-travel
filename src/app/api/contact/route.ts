import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/schemas";
import { consumeRateLimit, requestFingerprint, sameOrigin } from "@/lib/security";
import { sendEnquiryNotice } from "@/lib/mailer";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  try {
    const ipHash = requestFingerprint(request);
    if (!(await consumeRateLimit(`contact:${ipHash}`, 5))) {
      return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const parsed = contactSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Please check your message." }, { status: 400 });
    }
    const input = parsed.data;
    if (input.website) return NextResponse.json({ message: "Thank you. Your message was received." });

    const contact = await db.contactMessage.create({
      data: { name: input.name, email: input.email, subject: input.subject, message: input.message, consentAt: new Date(), ipHash },
      select: { id: true },
    });
    const emailSent = await sendEnquiryNotice({
      id: contact.id,
      name: input.name,
      email: input.email,
      destination: input.subject,
      message: input.message,
    });
    return NextResponse.json({ message: "Your message has been saved. We’ll be in touch.", reference: contact.id, emailSent }, { status: 201 });
  } catch (error) {
    console.error("Could not create contact message.", error instanceof Error ? error.message : "Unknown server error");
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Please send a valid message." }, { status: 400 });
    return NextResponse.json({ message: "Contact messages are temporarily unavailable." }, { status: 503 });
  }
}
