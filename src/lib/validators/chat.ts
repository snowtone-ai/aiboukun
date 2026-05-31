import { z } from "zod";
import { cuidSchema } from "@/lib/validators/common";

export const chatIntentSchema = z.enum([
  "show_reviews",
  "filter_reviews",
  "generate_reply_drafts",
  "approve_reply",
  "generate_report",
  "compare_competitors",
  "show_tasks",
  "create_task",
  "navigate",
  "unknown",
]);

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  organizationId: cuidSchema.optional(),
  storeId: cuidSchema.optional(),
});

export const parsedCommandSchema = z.object({
  intent: chatIntentSchema,
  storeId: cuidSchema.optional(),
  ratings: z.array(z.number().int().min(1).max(5)).max(5).optional(),
  period: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    })
    .optional(),
  action: z.string().max(100).optional(),
  route: z.string().max(200).optional(),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.array(z.number())])).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ParsedCommandInput = z.infer<typeof parsedCommandSchema>;
