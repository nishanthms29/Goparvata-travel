import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageCategory } from "@prisma/client";
import { PackageGrid } from "@/components/package-grid";
import { getPackages } from "@/lib/catalog";

const tourTypes: Record<string, { title: string; category: PackageCategory; description: string }> = {
  domestic: { title: "Domestic tours", category: PackageCategory.DOMESTIC, description: "Trip ideas around India. Routes, travel conditions and suppliers are confirmed with a planner." },
  international: { title: "International trips", category: PackageCategory.INTERNATIONAL, description: "Travel ideas beyond India. Flights, visa rules, entry requirements and accommodation are not live inventory." },
  adventure: { title: "Adventure travel", category: PackageCategory.ADVENTURE, description: "Outdoor routes planned around ability, current local conditions and the right pace." },
  honeymoon: { title: "Honeymoon trips", category: PackageCategory.HONEYMOON, description: "Thoughtful escapes shaped around the two of you, without a fixed template." },
  family: { title: "Family holidays", category: PackageCategory.FAMILY, description: "Family-friendly trip ideas with flexible days and practical details to confirm." },
  group: { title: "Group tours", category: PackageCategory.GROUP, description: "Routes for travelling together. Group departures are not confirmed until a planner issues written details." },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const page = tourTypes[type];
  return page ? { title: page.title, description: page.description } : { title: "Tours not found" };
}

export default async function TourTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const page = tourTypes[type];
  if (!page) notFound();
  const result = await getPackages({ category: page.category, pageSize: 12 });
  return <><section className="page-hero"><div className="shell"><p className="eyebrow"><span /> SAMPLE ROUTES</p><h1>{page.title}.</h1><p>{page.description}</p></div></section><section className="content-section shell"><p className="demo-banner">Planning examples only. No live inventory, supplier availability or confirmed departure is represented.</p><PackageGrid items={result.items} /></section></>;
}
