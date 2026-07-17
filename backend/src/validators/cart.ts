import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-f]{24}$/i, 'Geçersiz ürün id'),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
