import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { msg } from '../i18n';
import { processPayment, type CardInput } from './fakePay';

// processPayment gerçek ağ gecikmesini taklit etmek için 1 sn bekliyor.
// Sahte zamanlayıcı ile bu bekleme anında geçilir.
async function pay(overrides: Partial<CardInput> = {}) {
  const promise = processPayment({
    cardNumber: '4242424242424242',
    cardHolder: 'EMINE IZMIR',
    expiry: '12/30',
    cvv: '123',
    ...overrides,
  });
  await vi.runAllTimersAsync();
  return promise;
}

describe('processPayment', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('test kartı 4242… her zaman başarılı döner', async () => {
    const result = await pay({ cardNumber: '4242424242424242' });
    expect(result.success).toBe(true);
    expect(result.message).toBe(msg.paymentSuccess);
  });

  it('test kartı 4000… her zaman reddedilir', async () => {
    const result = await pay({ cardNumber: '4000000000000000' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.cardDeclined);
  });

  it('kart numarasındaki boşlukları yok sayar', async () => {
    const result = await pay({ cardNumber: '4242 4242 4242 4242' });
    expect(result.success).toBe(true);
  });

  it('süresi dolmuş kart, test kartı olmadığında reddedilir', async () => {
    // Luhn'dan geçen gerçek bir test numarası, geçmiş tarihli
    const result = await pay({ cardNumber: '4111111111111111', expiry: '01/20' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.cardExpired);
  });

  it('Luhn kontrolünden geçmeyen numara reddedilir', async () => {
    const result = await pay({ cardNumber: '4111111111111112' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.invalidCardNumber);
  });

  it('çok kısa numara reddedilir', async () => {
    const result = await pay({ cardNumber: '4111' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.invalidCardNumber);
  });

  it('rakam dışı karakter içeren numara reddedilir', async () => {
    const result = await pay({ cardNumber: '4111-1111-1111-1111' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.invalidCardNumber);
  });

  it('geçersiz ay değeri süresi dolmuş sayılır', async () => {
    const result = await pay({ cardNumber: '4111111111111111', expiry: '13/30' });
    expect(result.success).toBe(false);
    expect(result.message).toBe(msg.cardExpired);
  });

  it('geçerli kart + ileri tarih başarılı olur', async () => {
    const result = await pay({ cardNumber: '4111111111111111', expiry: '12/40' });
    expect(result.success).toBe(true);
    expect(result.message).toBe(msg.paymentSuccess);
  });

  it('her sonuçta benzersiz bir transactionId üretir', async () => {
    const first = await pay();
    const second = await pay();
    expect(first.transactionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(first.transactionId).not.toBe(second.transactionId);
  });
});
