import { describe, expect, it } from 'vitest';
import { createAddressSchema } from './address';

const valid = { title: 'Ev', text: 'Bahçelievler Mah. 12. Sok. No:3, Urla / İzmir' };

describe('createAddressSchema', () => {
  it('geçerli adresi kabul eder', () => {
    expect(createAddressSchema.safeParse(valid).success).toBe(true);
  });

  it('başlık en az 2 karakter olmalıdır', () => {
    expect(createAddressSchema.safeParse({ ...valid, title: 'E' }).success).toBe(false);
  });

  it('başlık 60 karakteri aşamaz', () => {
    expect(createAddressSchema.safeParse({ ...valid, title: 'a'.repeat(61) }).success).toBe(
      false,
    );
  });

  it('adres metni en az 5 karakter olmalıdır', () => {
    expect(createAddressSchema.safeParse({ ...valid, text: 'kısa' }).success).toBe(false);
  });

  it('adres metni 300 karakteri aşamaz', () => {
    expect(createAddressSchema.safeParse({ ...valid, text: 'a'.repeat(301) }).success).toBe(
      false,
    );
  });

  it('her iki alan da zorunludur', () => {
    expect(createAddressSchema.safeParse({ title: 'Ev' }).success).toBe(false);
    expect(createAddressSchema.safeParse({ text: valid.text }).success).toBe(false);
  });
});
