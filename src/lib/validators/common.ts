import { z } from "zod";

export const cuidSchema = z.string().min(1);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: "from must be before or equal to to",
    path: ["from"],
  });

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const routeParamsSchema = z.object({
  id: cuidSchema,
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
