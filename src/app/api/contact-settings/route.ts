import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const setting = await db.websiteSetting.findUnique({ where: { key: "whatsappBusinessNumber" }, select: { value: true } });
    const configured = setting
      ? typeof setting.value === "string" ? setting.value : ""
      : process.env.WHATSAPP_BUSINESS_NUMBER || "";
    const whatsappBusinessNumber = configured.replace(/\D/g, "").slice(0, 15);
    return NextResponse.json({ whatsappBusinessNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load WhatsApp contact settings.", error instanceof Error ? error.message : "Unknown server error");
    return NextResponse.json({ message: "Contact settings are temporarily unavailable." }, { status: 503 });
  }
}
