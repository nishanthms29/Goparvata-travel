import { ContentStatus, PackageCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-api";
import { packageSchema } from "@/lib/admin-schemas";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send valid package details." }, { status: 400 });
  }
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the package details." }, { status: 400 });
  const input = parsed.data;
  try {
    const destination = await db.destination.findUnique({ where: { slug: input.destinationSlug }, select: { id: true, name: true } });
    if (!destination) return NextResponse.json({ message: "Choose an existing destination." }, { status: 400 });
    const item = await db.tourPackage.create({
      data: {
        slug: input.slug,
        name: input.name,
        destinationId: destination.id,
        category: input.category as PackageCategory,
        shortDescription: input.shortDescription,
        description: input.description,
        days: input.days,
        nights: input.nights,
        adultPricePaise: input.adultPriceRupees * 100,
        childPricePaise: input.childPriceRupees === undefined ? null : input.childPriceRupees * 100,
        sampleOffer: input.sampleOffer,
        status: input.published ? ContentStatus.PUBLISHED : ContentStatus.DRAFT,
        cancellationPolicy: "The final cancellation schedule is provided in the written quotation before payment.",
        images: { create: [{ url: input.imageUrl, alt: `${input.name} sample travel photography`, displayOrder: 0 }] },
      },
      select: { id: true, slug: true },
    });
    await db.auditLog.create({ data: { actorId: access.user!.id, action: "PACKAGE_CREATED", entityType: "TourPackage", entityId: item.id, details: { slug: item.slug } } });
    return NextResponse.json({ message: "Package created.", package: item }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ message: "That package URL is already in use." }, { status: 409 });
    console.error("Could not create package.", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Package could not be created." }, { status: 503 });
  }
}
