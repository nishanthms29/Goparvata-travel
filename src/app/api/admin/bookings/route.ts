import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";

const quotedAmount = z.preprocess(
  (value) => value === "" || value === undefined ? null : value,
  z.coerce.number().int().nonnegative().max(100000000).nullable(),
);

const updateSchema = z.object({
  id: z.string().min(1).max(191),
  status: z.enum(["ENQUIRY", "CONFIRMED", "CANCELLED"]),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.email().max(190).transform((value) => value.trim().toLowerCase()),
  contactPhone: z.string().trim().min(7).max(30),
  quotedAmountRupees: quotedAmount,
  adminNotes: z.string().trim().max(4000),
});

export async function GET(request: Request) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  const page = Math.max(1, Math.min(1000, Number(new URL(request.url).searchParams.get("page")) || 1));
  const [items, total] = await Promise.all([
    db.booking.findMany({
      include: { package: { select: { name: true, slug: true } }, departureDate: { select: { startsAt: true, endsAt: true } }, payments: { select: { status: true, amountPaise: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 25,
      take: 25,
    }),
    db.booking.count(),
  ]);
  return NextResponse.json({ items, total, page, pageSize: 25 });
}

export async function PATCH(request: Request) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send valid trip request details." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the trip request details." }, { status: 400 });
  const input = parsed.data;
  try {
    const item = await db.booking.update({
      where: { id: input.id },
      data: {
        status: input.status,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        quotedAmountPaise: input.quotedAmountRupees === null ? null : input.quotedAmountRupees * 100,
        quotedAt: input.quotedAmountRupees === null ? null : new Date(),
        adminNotes: input.adminNotes || null,
        confirmedAt: input.status === "CONFIRMED" ? new Date() : null,
        cancelledAt: input.status === "CANCELLED" ? new Date() : null,
      },
      select: { id: true, status: true, quotedAmountPaise: true },
    });
    await db.auditLog.create({
      data: {
        actorId: access.user!.id,
        action: "TRIP_REQUEST_UPDATED",
        entityType: "Booking",
        entityId: item.id,
        details: { status: item.status, quotedAmountPaise: item.quotedAmountPaise },
      },
    });
    return NextResponse.json({ message: "Trip request details saved." });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ message: "Trip request not found." }, { status: 404 });
    console.error("Could not update trip request.", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Trip request could not be updated." }, { status: 503 });
  }
}
