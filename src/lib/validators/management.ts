import { z } from "zod";
import { cuidSchema } from "./common";

export const organizationUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  plan: z.string().trim().min(1).max(40).optional(),
});

export const brandCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const areaCreateSchema = z.object({
  brandId: cuidSchema,
  name: z.string().trim().min(1).max(120),
});

export const competitorCreateSchema = z.object({
  storeId: cuidSchema,
  name: z.string().trim().min(1).max(160),
  placeId: z.string().trim().max(200).optional(),
  mapUrl: z.url().optional(),
  notes: z.string().trim().max(2_000).optional(),
});

export const competitorUpdateSchema = competitorCreateSchema.omit({ storeId: true }).partial();

export const competitorSnapshotSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  recentReviewCount: z.number().int().min(0).optional(),
  photoCount: z.number().int().min(0).optional(),
  strengths: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  weaknesses: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
});

export const notificationCreateSchema = z.object({
  userId: cuidSchema.optional(),
  type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(1_000),
  actionUrl: z.string().trim().max(300).optional(),
});
