import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(8).max(120)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160).toLowerCase(),
  password: z.string().min(1).max(120)
});

export const boardSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(280).optional().default("")
});

export const cardCreateSchema = z.object({
  columnId: objectIdSchema,
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1200).optional().default(""),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  dueDate: z.string().datetime().nullable().optional()
});

export const cardUpdateSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(1200).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  columnId: objectIdSchema.optional(),
  position: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().nullable().optional()
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000)
});
