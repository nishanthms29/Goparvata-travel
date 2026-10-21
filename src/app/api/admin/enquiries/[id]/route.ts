import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";

const status = z.enum(["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"]);
const amount = z.preprocess(
  (value) => value === "" || value === undefined ? null : value,
  z.coerce.number().int().nonnegative().max(100000000).nullable(),
);
const enquirySchema = z.object({
  kind: z.literal("enquiry"),
  status,
  name: z.string().trim().min(2).max(120),
  email: z.email().max(190).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).nullable(),
  quotedAmountRupees: amount,
  adminNotes: z.string().trim().max(4000),
});
const contactSchema = z.object({
  kind: z.literal("contact"),
  status,
  name: z.string().trim().min(2).max(120),
  email: z.email().max(190).transform((value) => value.toLowerCase()),
  subject: z.string().trim().min(3).max(160),
  adminNotes: z.string().trim().max(4000),
});
const updateSchema = z.discriminatedUnion("kind", [enquirySchema, contactSchema]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send valid enquiry details." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the enquiry details." }, { status: 400 });
  try {
    const input = parsed.data;
    if (input.kind === "enquiry") {
      const record = await db.enquiry.update({
        where: { id },
        data: {
          status: input.status,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          quotedAmountPaise: input.quotedAmountRupees === null ? null : input.quotedAmountRupees * 100,
          quotedAt: input.quotedAmountRupees === null ? null : new Date(),
          adminNotes: input.adminNotes || null,
        },
      });
      await db.auditLog.create({ data: { actorId: access.user!.id, action: "ENQUIRY_UPDATED", entityType: "Enquiry", entityId: id, details: { status: record.status } } });
    } else {
      const record = await db.contactMessage.update({
        where: { id },
        data: { status: input.status, name: input.name, email: input.email, subject: input.subject, adminNotes: input.adminNotes || null },
      });
      await db.auditLog.create({ data: { actorId: access.user!.id, action: "CONTACT_MESSAGE_UPDATED", entityType: "ContactMessage", entityId: id, details: { status: record.status } } });
    }
    return NextResponse.json({ message: "Enquiry details saved." });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ message: "Enquiry not found." }, { status: 404 });
    console.error("Could not update enquiry status.", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Enquiry update failed." }, { status: 503 });
  }
}
