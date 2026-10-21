import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { BookingStatus, ContentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { bookingSchema } from "@/lib/schemas";
import { calculatePrice } from "@/lib/pricing";
import { consumeRateLimit, requestFingerprint, sameOrigin } from "@/lib/security";
import { sendEnquiryNotice } from "@/lib/mailer";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  try {
    const ipHash = requestFingerprint(request);
    if (!(await consumeRateLimit(`booking:${ipHash}`, 5))) {
      return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Please check the booking details." }, { status: 400 });
    const input = parsed.data;
    if (input.website) return NextResponse.json({ message: "Request received." }, { status: 202 });
    if (input.adults + input.children > 20) return NextResponse.json({ message: "Choose 20 travellers or fewer." }, { status: 400 });

    const packageInfo = await db.tourPackage.findFirst({
      where: { slug: input.packageSlug, status: ContentStatus.PUBLISHED },
      select: { id: true, name: true, adultPricePaise: true, childPricePaise: true, sampleOffer: true, destination: { select: { name: true } } },
    });
    if (!packageInfo) return NextResponse.json({ message: "This trip is not available for enquiries." }, { status: 404 });

    let discountPaise = 0;
    let couponCode: string | null = null;
    if (input.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
      const now = new Date();
      if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)
        || (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)) {
        return NextResponse.json({ message: "That coupon is not currently valid." }, { status: 400 });
      }
      const base = calculatePrice({ adultPricePaise: packageInfo.adultPricePaise, childPricePaise: packageInfo.childPricePaise, adults: input.adults, children: input.children });
      if (base.subtotalPaise < coupon.minimumPaise) return NextResponse.json({ message: "This coupon does not meet its minimum spend." }, { status: 400 });
      discountPaise = coupon.percentOff
        ? Math.floor(base.subtotalPaise * coupon.percentOff / 100)
        : coupon.amountOffPaise ?? 0;
      if (coupon.maxDiscountPaise !== null) discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
      discountPaise = Math.min(discountPaise, base.subtotalPaise);
      couponCode = coupon.code;
    }

    const price = calculatePrice({
      adultPricePaise: packageInfo.adultPricePaise,
      childPricePaise: packageInfo.childPricePaise,
      adults: input.adults,
      children: input.children,
      discountPaise,
    });
    const reference = `TC-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(8).toString("hex").toUpperCase()}`;
    const booking = await db.booking.create({
      data: {
        reference,
        userId: null,
        packageId: packageInfo.id,
        status: BookingStatus.ENQUIRY,
        contactName: input.name,
        contactEmail: input.email,
        contactPhone: input.phone,
        adults: input.adults,
        children: input.children,
        subtotalPaise: price.subtotalPaise,
        discountPaise: price.discountPaise,
        taxPaise: price.taxPaise,
        feePaise: price.feePaise,
        totalPaise: price.totalPaise,
        couponCode,
        quotationOnly: true,
      },
      select: { reference: true, id: true },
    });
    const enquiryMessage = input.message || `Quote request for ${input.adults} adult(s) and ${input.children} child(ren). Package: ${packageInfo.name}.`;
    const emailSent = await sendEnquiryNotice({
      id: booking.reference,
      name: input.name,
      email: input.email,
      destination: `${packageInfo.destination.name} — ${packageInfo.name}`,
      travellers: input.adults + input.children,
      message: enquiryMessage,
    });
    return NextResponse.json({
      message: "Your quotation request has been saved. This is not a reservation and no payment has been taken.",
      reference: booking.reference,
      bookingId: booking.id,
      totalPaise: price.totalPaise,
      emailSent,
      sampleOffer: packageInfo.sampleOffer,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Please send a valid quotation request." }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      console.error("Booking reference collision while creating quote request.");
    } else {
      console.error("Could not create quotation request.", error instanceof Error ? error.message : "Unknown server error");
    }
    return NextResponse.json({ message: "Quotation requests are temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
