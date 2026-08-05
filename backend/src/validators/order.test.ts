import { describe, expect, it } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema } from './order';

const validObjectId = '6a7332ed15f842936335c36b';

describe('createOrderSchema', () => {
  it('geçerli ObjectId biçimindeki addressId kabul edilir', () => {
    expect(createOrderSchema.safeParse({ addressId: validObjectId }).success).toBe(true);
  });

  it('addressId zorunludur', () => {
    expect(createOrderSchema.safeParse({}).success).toBe(false);
  });

  it('ObjectId biçiminde olmayan değeri reddeder', () => {
    expect(createOrderSchema.safeParse({ addressId: 'abc' }).success).toBe(false);
    expect(createOrderSchema.safeParse({ addressId: validObjectId + '00' }).success).toBe(
      false,
    );
  });
});

describe('updateOrderStatusSchema', () => {
  it('SHIPPED ve DELIVERED kabul edilir', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'SHIPPED' }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: 'DELIVERED' }).success).toBe(true);
  });

  it('satıcının atlayamayacağı durumlar şema düzeyinde reddedilir', () => {
    for (const status of ['PAID', 'PENDING_PAYMENT', 'PAYMENT_FAILED', 'shipped']) {
      expect(updateOrderStatusSchema.safeParse({ status }).success).toBe(false);
    }
  });

  it('status alanı zorunludur', () => {
    expect(updateOrderStatusSchema.safeParse({}).success).toBe(false);
  });
});
