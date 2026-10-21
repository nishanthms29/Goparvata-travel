import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireAdminResponse() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, response: NextResponse.json({ message: "Sign in to continue." }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { user: null, response: NextResponse.json({ message: "Administrator access is required." }, { status: 403 }) };
  }
  const account = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (account?.role !== "ADMIN") {
    return { user: null, response: NextResponse.json({ message: "Administrator access is required." }, { status: 403 }) };
  }
  return { user: session.user, response: null };
}
