import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
});

// ─── Recipe Schemas ───────────────────────────────────────────────────────────

export const recipeSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(500),
  image: z.string().url().optional().or(z.literal("")),
  ingredients: z.array(z.string().min(1)).min(1, "Minimal 1 bahan"),
  steps: z.array(z.string().min(1)).min(1, "Minimal 1 langkah"),
  category: z.enum(["Makanan", "Minuman", "Cemilan"]),
  tags: z.array(z.string()).optional(),
  prepTimeMinutes: z.number().int().min(0).optional(),
  cookTimeMinutes: z.number().int().min(0).optional(),
  servings: z.number().int().min(1).optional(),
  published: z.boolean().optional(),
  memberOnly: z.boolean().optional(),
});

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const recipeRequestSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  recipeName: z.string().min(3, "Nama resep minimal 3 karakter").max(100),
  message: z.string().max(500).optional(),
  memberId: z.string().optional(),
});

// ─── Rating Schema ────────────────────────────────────────────────────────────

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating harus antara 1-5"),
});

// ─── Payment Schema ───────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  packageId: z.enum(["starter", "basic", "pro"]),
  mobile: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor HP tidak valid").optional(),
});

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(errors);
  }
  return result.data;
}
