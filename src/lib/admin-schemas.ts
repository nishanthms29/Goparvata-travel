import { z } from "zod";

export const packageSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  name: z.string().trim().min(2).max(160),
  destinationSlug: z.string().trim().min(1).max(100),
  category: z.enum(["DOMESTIC", "INTERNATIONAL", "ADVENTURE", "HONEYMOON", "FAMILY", "GROUP", "CORPORATE"]),
  shortDescription: z.string().trim().min(10).max(320),
  description: z.string().trim().min(20).max(10000),
  days: z.coerce.number().int().min(1).max(60),
  nights: z.coerce.number().int().min(0).max(59),
  adultPriceRupees: z.coerce.number().int().positive().max(100000000),
  childPriceRupees: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number().int().nonnegative().max(100000000).optional(),
  ),
  imageUrl: z.url().refine((value) => new URL(value).protocol === "https:"),
  published: z.coerce.boolean().default(false),
  sampleOffer: z.coerce.boolean().default(true),
});
