import { z } from "zod";

const email = z.email().max(190).transform((value) => value.trim().toLowerCase());
const phone = z.string().trim().min(7).max(30);
const consent = z.preprocess((value) => value === true || value === "true" || value === "on", z.literal(true));

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  phone: phone.optional().or(z.literal("")),
  destination: z.string().trim().max(100).optional().or(z.literal("")),
  packageSlug: z.string().trim().max(100).optional().or(z.literal("")),
  travellers: z.coerce.number().int().min(1).max(20).optional(),
  travelMonth: z.string().trim().max(30).optional().or(z.literal("")),
  budgetRupees: z.coerce.number().int().nonnegative().max(100000000).optional(),
  message: z.string().trim().min(5).max(2000),
  consent,
  website: z.string().trim().max(200).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(4000),
  consent,
  website: z.string().trim().max(200).optional(),
});

export const bookingSchema = z.object({
  packageSlug: z.string().trim().min(1).max(100),
  departureDateId: z.string().trim().max(100).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  email,
  phone: phone,
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  consent,
  website: z.string().trim().max(200).optional(),
});

export const packageSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  destination: z.string().trim().max(100).optional(),
  category: z.enum(["DOMESTIC", "INTERNATIONAL", "ADVENTURE", "HONEYMOON", "FAMILY", "GROUP", "CORPORATE"]).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  days: z.coerce.number().int().min(1).max(60).optional(),
  familyFriendly: z.coerce.boolean().optional(),
  honeymoon: z.coerce.boolean().optional(),
  sort: z.enum(["price", "newest", "popular"]).default("popular"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
