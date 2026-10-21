import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { enquirySchema } from "@/lib/schemas";
import { consumeRateLimit, requestFingerprint, sameOrigin } from "@/lib/security";
import { sendEnquiryNotice } from "@/lib/mailer";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  const ipHash = requestFingerprint(request);
  try {
    if (!(await consumeRateLimit(`enquiry:${ipHash}`, 5))) {
      return NextResponse.json({ message: "Too many requests. Please try again in a few minutes." }, { status: 429 });
    }
    const parsed = enquirySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Please check your enquiry details." }, { status: 400 });
    }
    const input = parsed.data;
    if (input.website) return NextResponse.json({ message: "Thank you. Your enquiry was received.", reference: "received", emailSent: false });

    const enquiry = await db.enquiry.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        destination: input.destination || null,
        packageSlug: input.packageSlug || null,
        travellers: input.travellers ?? null,
        travelMonth: input.travelMonth || null,
        budgetPaise: input.budgetRupees ? input.budgetRupees * 100 : null,
        message: input.message,
        consentAt: new Date(),
        ipHash,
      },
      select: { id: true, destination: true, packageSlug: true, travellers: true },
    });
    const emailSent = await sendEnquiryNotice({
      id: enquiry.id,
      name: input.name,
      email: input.email,
      destination: enquiry.destination || enquiry.packageSlug || "Not sure yet",
      travellers: enquiry.travellers ?? undefined,
      message: input.message,
    });
    return NextResponse.json({
      message: "Your request has been saved. A travel planner will review it.",
      reference: enquiry.id,
      emailSent,
    }, { status: 201 });
  } catch (error) {
    console.error("Could not create travel enquiry.", error instanceof Error ? error.message : "Unknown server error");
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return NextResponse.json({ message: "Please send a valid enquiry." }, { status: 400 });
    }
    return NextResponse.json({ message: "Enquiries are temporarily unavailable. Please email the travel team directly." }, { status: 503 });
  }
}
