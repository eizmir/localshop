import { z } from 'zod';

export const paySchema = z.object({
  orderId: z.string().regex(/^[0-9a-f]{24}$/i, 'Geçersiz sipariş id'),
  cardNumber: z.string().min(13).max(23),
  cardHolder: z.string().min(2).max(100),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format MM/YY olmalı'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV 3-4 haneli olmalı'),
});

export type PayInput = z.infer<typeof paySchema>;
