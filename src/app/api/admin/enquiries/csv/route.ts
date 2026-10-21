import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";

function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  const rows = await db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });
  const lines = [
    ["Reference", "Created at", "Name", "Email", "Phone", "Destination", "Travellers", "Status", "Message"].map(csvCell).join(","),
    ...rows.map((row) => [row.id, row.createdAt.toISOString(), row.name, row.email, row.phone, row.destination, row.travellers, row.status, row.message].map(csvCell).join(",")),
  ];
  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="travel-enquiries.csv"',
      "Cache-Control": "no-store",
    },
  });
}
