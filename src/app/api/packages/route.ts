import { NextResponse } from "next/server";
import { getPackages } from "@/lib/catalog";
import { packageSearchSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = packageSearchSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid search filters.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const filters = parsed.data;
  const result = await getPackages({
    query: filters.q,
    destination: filters.destination,
    category: filters.category,
    minPriceRupees: filters.minPrice,
    maxPriceRupees: filters.maxPrice,
    familyFriendly: filters.familyFriendly,
    honeymoon: filters.honeymoon,
    sort: filters.sort,
    page: filters.page,
  });
  return NextResponse.json({
    items: result.items,
    total: result.total,
    page: filters.page,
    pageSize: 9,
    demo: result.demo,
  });
}
