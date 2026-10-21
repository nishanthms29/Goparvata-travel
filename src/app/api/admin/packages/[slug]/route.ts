import { ContentStatus, PackageCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { packageSchema } from "@/lib/admin-schemas";

const updateSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });
const editSchema = packageSchema.omit({ slug: true, published: true });

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const access = await requireAdminResponse();
  if (access.response) return access.response;
  if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send a valid package status." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Choose a valid package status." }, { status: 400 });
  try {
    const item = await db.tourPackage.update({
      where: { slug },
      data: { status: parsed.data.status as ContentStatus },
      select: { id: true, status: true },
    });
    await db.auditLog.create({ data: { actorId: access.user!.id, action: "PACKAGE_STATUS_UPDATED", entityType: "TourPackage", entityId: item.id, details: { status: item.status } } });
    return NextResponse.json({ message: "Package status updated." });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ message: "Package not found." }, { status: 404 });
    console.error("Could not update package status.", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Package update failed." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const access = await requireAdminResponse();
    if (access.response) return access.response;
    if (!sameOrigin(request)) return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
    const { slug } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Send valid package details." }, { status: 400 });
    }
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check the package details." }, { status: 400 });
    const input = parsed.data;
    try {
      const destination = await db.destination.findUnique({ where: { slug: input.destinationSlug }, select: { id: true } });
      if (!destination) return NextResponse.json({ message: "Choose an existing destination." }, { status: 400 });

      const item = await db.$transaction(async (transaction) => {
        const updated = await transaction.tourPackage.update({
          where: { slug },
          data: {
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
          },
          select: { id: true, slug: true },
        });
        const image = await transaction.packageImage.findFirst({ where: { packageId: updated.id }, orderBy: { displayOrder: "asc" } });
        if (image) {
          await transaction.packageImage.update({ where: { id: image.id }, data: { url: input.imageUrl, alt: `${input.name} sample travel photography` } });
        } else {
          await transaction.packageImage.create({ data: { packageId: updated.id, url: input.imageUrl, alt: `${input.name} sample travel photography`, displayOrder: 0 } });
        }
        return updated;
      });
      await db.auditLog.create({ data: { actorId: access.user!.id, action: "PACKAGE_UPDATED", entityType: "TourPackage", entityId: item.id, details: { slug: item.slug } } });
      return NextResponse.json({ message: "Package details updated." });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ message: "Package not found." }, { status: 404 });
      console.error("Could not edit package.", error instanceof Error ? error.message : error);
      return NextResponse.json({ message: "Package could not be updated." }, { status: 503 });
  }
}
