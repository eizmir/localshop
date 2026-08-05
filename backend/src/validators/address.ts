import { z } from 'zod';

export const createAddressSchema = z.object({
  title: z.string().min(2).max(60),
  text: z.string().min(5).max(300),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
