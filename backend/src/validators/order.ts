import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().regex(/^[0-9a-f]{24}$/i),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['SHIPPED', 'DELIVERED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
