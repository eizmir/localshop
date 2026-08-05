import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { msg } from '../i18n';
import { User, type UserDoc } from '../models/User';
import { register, toPublicUser } from './authService';

// vi.mock çağrıları import'ların üstüne taşınır, bu yüzden yukarıdaki
// statik import mock'lanmış modülü alır.
vi.mock('../models/User', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../models/User')>();
  return {
    ...actual,
    User: { findOne: vi.fn(), create: vi.fn() },
  };
});

function fakeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: new Types.ObjectId(),
    name: 'Emine İzmir',
    email: 'emine@example.com',
    password: '$2a$12$cokgizlihashdegeri',
    role: 'customer',
    phone: '05551234567',
    addresses: [
      { _id: new Types.ObjectId(), title: 'Ev', text: 'Urla / İzmir' },
      { _id: new Types.ObjectId(), title: 'İş', text: 'Gebze / Kocaeli' },
    ],
    createdAt: new Date('2026-08-05T10:00:00Z'),
    ...overrides,
  } as unknown as UserDoc;
}

describe('toPublicUser', () => {
  it('şifreyi asla dışarı vermez', () => {
    const result = toPublicUser(fakeUser());
    expect(result).not.toHaveProperty('password');
    expect(JSON.stringify(result)).not.toContain('$2a$12$');
  });

  it('kimliği string olarak döndürür', () => {
    const user = fakeUser();
    expect(toPublicUser(user).id).toBe(String(user._id));
    expect(typeof toPublicUser(user).id).toBe('string');
  });

  it('adresleri id/title/text biçiminde serileştirir', () => {
    const result = toPublicUser(fakeUser());
    expect(result.addresses).toHaveLength(2);
    expect(result.addresses[0]).toEqual({
      id: expect.any(String),
      title: 'Ev',
      text: 'Urla / İzmir',
    });
  });

  it('adresi olmayan kullanıcıda boş dizi döner', () => {
    expect(toPublicUser(fakeUser({ addresses: [] })).addresses).toEqual([]);
  });
});

describe('register', () => {
  beforeEach(() => {
    vi.mocked(User.findOne).mockReset();
    vi.mocked(User.create).mockReset();
  });

  it('aynı e-posta varsa 409 verir', async () => {
    vi.mocked(User.findOne).mockResolvedValue(fakeUser() as never);

    await expect(
      register({
        name: 'Emine',
        email: 'emine@example.com',
        password: 'parola12345',
        role: 'customer',
        phone: '05551234567',
      }),
    ).rejects.toMatchObject({ status: 409, message: msg.emailTaken });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('kayıttaki tekil adresi adres listesinin ilk kaydına dönüştürür', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null as never);
    vi.mocked(User.create).mockImplementation(
      async (doc: unknown) => fakeUser(doc as Record<string, unknown>) as never,
    );

    await register({
      name: 'Emine',
      email: 'yeni@example.com',
      password: 'parola12345',
      role: 'customer',
      phone: '05551234567',
      address: 'Urla / İzmir',
    });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        addresses: [{ title: msg.defaultAddressTitle, text: 'Urla / İzmir' }],
      }),
    );
  });

  it('adres verilmediğinde boş adres listesiyle oluşturur', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null as never);
    vi.mocked(User.create).mockImplementation(
      async (doc: unknown) => fakeUser(doc as Record<string, unknown>) as never,
    );

    await register({
      name: 'Emine',
      email: 'yeni@example.com',
      password: 'parola12345',
      role: 'seller',
      phone: '05551234567',
    });

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ addresses: [] }));
  });

  it('ham address alanını modele sızdırmaz', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null as never);
    vi.mocked(User.create).mockImplementation(
      async (doc: unknown) => fakeUser(doc as Record<string, unknown>) as never,
    );

    await register({
      name: 'Emine',
      email: 'yeni@example.com',
      password: 'parola12345',
      role: 'customer',
      phone: '05551234567',
      address: 'Urla / İzmir',
    });

    const passed = vi.mocked(User.create).mock.calls[0]?.[0] as Record<string, unknown>;
    expect(passed).not.toHaveProperty('address');
  });

  it('başarılı kayıtta token ve şifresiz kullanıcı döner', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null as never);
    vi.mocked(User.create).mockResolvedValue(fakeUser() as never);

    const result = await register({
      name: 'Emine',
      email: 'yeni@example.com',
      password: 'parola12345',
      role: 'customer',
      phone: '05551234567',
    });

    expect(result.token.split('.')).toHaveLength(3);
    expect(result.user).not.toHaveProperty('password');
  });
});
