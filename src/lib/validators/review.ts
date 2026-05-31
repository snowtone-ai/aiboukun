import { z } from "zod";
import { paginationSchema, dateRangeSchema, sortOrderSchema, cuidSchema } from "@/lib/validators/common";

export const ratingSchema = z.coerce.number().int().min(1).max(5);

export const reviewFilterSchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    storeId: cuidSchema.optional(),
    ratings: z.array(ratingSchema).max(5).optional(),
    replyStatus: z.enum(["UNREPLIED", "DRAFTED", "APPROVED", "POSTED", "SKIPPED"]).optional(),
    sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).optional(),
    riskLevel: z.enum(["NORMAL", "ATTENTION", "URGENT", "LEGAL", "MEDICAL", "PRIVACY", "SAFETY"]).optional(),
    q: z.string().trim().max(100).optional(),
    sort: z.enum(["publishedAt", "rating", "updatedAt"]).default("publishedAt"),
    order: sortOrderSchema,
  });

export const reviewDraftRequestSchema = z.object({
  reviewId: cuidSchema,
  tone: z.enum(["polite", "warm", "concise"]).default("warm"),
});

export const replyDraftUpdateSchema = z.object({
  body: z.string().trim().min(1).max(2_000),
  status: z.enum(["DRAFT", "EDITED", "APPROVED", "REJECTED"]).optional(),
});

export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;
export type ReviewDraftRequestInput = z.infer<typeof reviewDraftRequestSchema>;
export type ReplyDraftUpdateInput = z.infer<typeof replyDraftUpdateSchema>;
