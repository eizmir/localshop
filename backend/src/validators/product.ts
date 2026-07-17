import { z } from 'zod';
import { CATEGORIES } from '../constants/categories';

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.enum(CATEGORIES),
  imageUrl: z
    .string()
    .regex(/^\/uploads\/[\w.-]+$/, 'Geçersiz görsel yolu')
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  sellerId: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
