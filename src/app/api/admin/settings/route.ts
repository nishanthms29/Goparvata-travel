import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";

const updateSchema = z.object({
  whatsappBusinessNumber: z.string().trim().max(15).regex(/^(?:\d{8,15})?$/),
});

export async function PATCH(request: Request) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send valid contact settings." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid international WhatsApp number or leave the field blank." }, { status: 400 });
  try {
    await db.$transaction(async (transaction) => {
      await transaction.websiteSetting.upsert({
        where: { key: "whatsappBusinessNumber" },
        update: { value: parsed.data.whatsappBusinessNumber },
        create: { key: "whatsappBusinessNumber", value: parsed.data.whatsappBusinessNumber },
      });
      await transaction.auditLog.create({
        data: {
          actorId: access.user!.id,
          action: "WHATSAPP_CONTACT_UPDATED",
          entityType: "WebsiteSetting",
          entityId: "whatsappBusinessNumber",
          details: { configured: parsed.data.whatsappBusinessNumber.length > 0 },
        },
      });
    });
    return NextResponse.json({ message: "WhatsApp contact setting saved." });
  } catch (error) {
    console.error("Could not save WhatsApp contact setting.", error instanceof Error ? error.message : "Unknown server error");
    return NextResponse.json({ message: "WhatsApp contact setting could not be saved." }, { status: 503 });
  }
}
