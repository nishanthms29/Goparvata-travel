import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeRateLimit, requestFingerprint, sameOrigin } from "@/lib/security";

const newsletterSchema = z.object({
  email: z.email().max(190),
  consent: z.preprocess((value) => value === true || value === "true" || value === "on", z.literal(true)),
  website: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  try {
    const ipHash = requestFingerprint(request);
    if (!(await consumeRateLimit(`newsletter:${ipHash}`, 5))) {
      return NextResponse.json({ message: "Please try again later." }, { status: 429 });
    }
    const parsed = newsletterSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: "Enter a valid email and accept the privacy notice." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ message: "Thank you for signing up." });
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.trim().toLowerCase() },
      update: { unsubscribedAt: null, consentAt: new Date() },
      create: { email: parsed.data.email.trim().toLowerCase(), consentAt: new Date() },
    });
    return NextResponse.json({ message: "Thanks — you are subscribed." }, { status: 201 });
  } catch (error) {
    console.error("Could not save newsletter signup.", error instanceof Error ? error.message : "Unknown server error");
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Please send valid signup details." }, { status: 400 });
    return NextResponse.json({ message: "Newsletter signup is temporarily unavailable." }, { status: 503 });
  }
}
