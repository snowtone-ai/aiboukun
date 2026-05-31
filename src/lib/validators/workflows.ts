import { z } from "zod";
import { cuidSchema, paginationSchema } from "./common";

const optionalDate = z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional());
const commaList = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}, z.array(z.string()).optional());

export const reviewListQuerySchema = paginationSchema.extend({
  storeId: cuidSchema.optional(),
  ratings: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }
      return value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item));
    },
    z.array(z.number().int().min(1).max(5)).max(5).optional(),
  ),
  replyStatus: z.enum(["UNREPLIED", "DRAFTED", "APPROVED", "POSTED", "SKIPPED"]).optional(),
  riskLevel: z.enum(["NORMAL", "ATTENTION", "URGENT", "LEGAL", "MEDICAL", "PRIVACY", "SAFETY"]).optional(),
  q: z.string().trim().max(100).optional(),
  from: optionalDate,
  to: optionalDate,
});

export const draftPatchSchema = z.object({
  body: z.string().trim().min(1).max(2_000).optional(),
  status: z.enum(["DRAFT", "EDITED", "APPROVED", "REJECTED"]).optional(),
});

export const reportGenerateSchema = z.object({
  storeId: cuidSchema.optional(),
  type: z.enum(["WEEKLY", "MONTHLY", "HQ", "STORE_MANAGER"]).default("WEEKLY"),
  periodStart: optionalDate,
  periodEnd: optionalDate,
});

export const reportListQuerySchema = paginationSchema.extend({
  storeId: cuidSchema.optional(),
  type: z.enum(["WEEKLY", "MONTHLY", "HQ", "STORE_MANAGER"]).optional(),
});

export const taskListQuerySchema = paginationSchema.extend({
  storeId: cuidSchema.optional(),
  status: z.enum(["TODO", "DOING", "DONE", "DISMISSED"]).optional(),
});

export const taskCreateSchema = z.object({
  storeId: cuidSchema,
  title: z.string().trim().min(1).max(160),
  detail: z.string().trim().max(2_000).optional(),
  type: z.enum([
    "REVIEW_REPLY",
    "RISK_RESPONSE",
    "PROFILE_UPDATE",
    "PHOTO_ADD",
    "REVIEW_REQUEST",
    "SERVICE_IMPROVEMENT",
    "COMPETITOR_ACTION",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: optionalDate,
});

export const taskPatchSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  detail: z.string().trim().max(2_000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "DOING", "DONE", "DISMISSED"]).optional(),
  dueDate: optionalDate,
});

export const insightQuerySchema = z.object({
  storeId: cuidSchema.optional(),
  period: z.enum(["30d", "90d", "180d"]).default("30d"),
});

export const competitorCompareSchema = z.object({
  storeId: cuidSchema.optional(),
});

export const storeCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  industry: z
    .enum(["RESTAURANT", "BEAUTY_SALON", "DENTAL", "BEAUTY_CLINIC", "BODY_CARE", "HOTEL", "RETAIL", "OTHER"])
    .default("OTHER"),
  brandId: cuidSchema.optional(),
  areaId: cuidSchema.optional(),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(40).optional(),
});

export const settingsPatchSchema = z.object({
  organizationName: z.string().trim().min(1).max(120).optional(),
  replyTone: z.enum(["polite", "warm", "concise"]).optional(),
  notificationTypes: commaList,
});

export const auditLogQuerySchema = z.object({
  cursor: cuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const googleCallbackSchema = z.object({
  accessToken: z.string().trim().min(1),
  refreshToken: z.string().trim().min(1).optional(),
  expiresAt: optionalDate,
  scopes: commaList.default(["https://www.googleapis.com/auth/business.manage"]),
});

export const googleLocationsQuerySchema = z.object({
  accountName: z.string().trim().min(1).optional(),
});

export const connectLocationSchema = z.object({
  storeId: cuidSchema,
  googleAccountName: z.string().trim().min(1),
  googleLocationName: z.string().trim().min(1),
  placeId: z.string().trim().max(200).optional(),
  title: z.string().trim().max(200).optional(),
  verified: z.boolean().default(false),
  raw: z.unknown().optional(),
});

export const googleSyncSchema = z.object({
  storeId: cuidSchema,
  pageToken: z.string().trim().min(1).max(500).optional(),
});
