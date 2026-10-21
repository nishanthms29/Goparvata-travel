import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  const page = Math.max(1, Math.min(1000, Number(new URL(request.url).searchParams.get("page")) || 1));
  const [items, total] = await Promise.all([
    db.enquiry.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * 25, take: 25 }),
    db.enquiry.count(),
  ]);
  return NextResponse.json({ items, total, page, pageSize: 25 });
}
