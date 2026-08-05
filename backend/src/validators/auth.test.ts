import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth';

const validRegister = {
  name: 'Emine İzmir',
  email: 'emine@example.com',
  password: 'parola12345',
  role: 'customer' as const,
  phone: '0555 123 45 67',
};

function issuePaths(input: unknown) {
  const result = registerSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
}

describe('registerSchema', () => {
  it('geçerli kayıt bilgilerini kabul eder', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it('adres opsiyoneldir — adressiz kayıt geçerlidir', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
    expect(
      registerSchema.safeParse({ ...validRegister, address: 'Urla / İzmir' }).success,
    ).toBe(true);
  });

  it('telefon zorunludur', () => {
    const { phone, ...withoutPhone } = validRegister;
    void phone;
    expect(issuePaths(withoutPhone)).toContain('phone');
  });

  it('geçersiz telefon biçimini Türkçe mesajla reddeder', () => {
    const result = registerSchema.safeParse({ ...validRegister, phone: 'abc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Geçersiz telefon numarası');
    }
  });

  it('boşluk ve parantez içeren telefonu kabul eder', () => {
    expect(
      registerSchema.safeParse({ ...validRegister, phone: '+90 (555) 123-4567' }).success,
    ).toBe(true);
  });

  it('8 karakterden kısa şifreyi reddeder', () => {
    expect(issuePaths({ ...validRegister, password: 'kisa' })).toContain('password');
  });

  it('geçersiz e-postayı reddeder', () => {
    expect(issuePaths({ ...validRegister, email: 'emine[at]example.com' })).toContain('email');
  });

  it('tanımsız rolü reddeder', () => {
    expect(issuePaths({ ...validRegister, role: 'admin' })).toContain('role');
  });

  it('çok kısa adresi reddeder', () => {
    expect(issuePaths({ ...validRegister, address: 'abc' })).toContain('address');
  });
});

describe('loginSchema', () => {
  it('e-posta ve şifreyi kabul eder', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('boş şifreyi reddeder', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});
