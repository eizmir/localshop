import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { env } from '../config/env';
import { msg } from '../i18n';
import { authenticate, authorize } from './auth';

function mockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: { message: string } };
}

function tokenFor(payload: { id: string; role: 'customer' | 'seller' }, expiresIn = '1d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

describe('authenticate', () => {
  it('geçerli token ile req.user doldurulur ve next çağrılır', () => {
    const req = {
      headers: { authorization: `Bearer ${tokenFor({ id: 'u1', role: 'seller' })}` },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({ id: 'u1', role: 'seller' });
  });

  it('Authorization başlığı yoksa 401 döner', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(msg.authRequired);
    expect(next).not.toHaveBeenCalled();
  });

  it('Bearer öneki olmayan başlık reddedilir', () => {
    const req = { headers: { authorization: 'Token abc' } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(msg.authRequired);
  });

  it('imzası bozuk token 401 döner', () => {
    const req = { headers: { authorization: 'Bearer sahte.token.degeri' } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(msg.invalidToken);
  });

  it('başka bir gizli anahtarla imzalanmış token kabul edilmez', () => {
    const foreign = jwt.sign({ id: 'u1', role: 'customer' }, 'baska-bir-gizli-anahtar');
    const req = { headers: { authorization: `Bearer ${foreign}` } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(msg.invalidToken);
  });

  it('süresi dolmuş token 401 döner', () => {
    const expired = jwt.sign({ id: 'u1', role: 'customer' }, env.JWT_SECRET, {
      expiresIn: '-1s',
    } as jwt.SignOptions);
    const req = { headers: { authorization: `Bearer ${expired}` } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(msg.invalidToken);
  });
});

describe('authorize', () => {
  it('izin verilen rol geçer', () => {
    const req = { user: { id: 'u1', role: 'seller' } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authorize('seller')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('yanlış rol 403 döner', () => {
    const req = { user: { id: 'u1', role: 'customer' } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authorize('seller')(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(msg.forbidden);
    expect(next).not.toHaveBeenCalled();
  });

  it('birden fazla rol verildiğinde herhangi biri yeterlidir', () => {
    const req = { user: { id: 'u1', role: 'customer' } } as Request;
    const next = vi.fn() as unknown as NextFunction;

    authorize('customer', 'seller')(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('kimlik doğrulanmamış istek 403 döner', () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    authorize('customer')(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
