import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { msg } from '../i18n';
import { ApiError, errorHandler, notFoundHandler } from './errorHandler';

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

describe('ApiError', () => {
  it('durum kodunu ve mesajı taşır', () => {
    const err = new ApiError(404, 'yok');
    expect(err.status).toBe(404);
    expect(err.message).toBe('yok');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('notFoundHandler', () => {
  it('tanımsız route için 404 ve Türkçe mesaj döner', () => {
    const res = mockRes();
    notFoundHandler({} as Request, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: msg.notFound });
  });
});

describe('errorHandler', () => {
  const next = vi.fn() as unknown as NextFunction;

  it('ApiError kendi durum kodu ve mesajıyla döner', () => {
    const res = mockRes();
    errorHandler(new ApiError(403, msg.forbidden), {} as Request, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: msg.forbidden });
  });

  it('beklenmeyen hata 500 döner ve iç detayı sızdırmaz', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockRes();

    errorHandler(new Error('veritabanı bağlantı dizesi: mongodb://gizli'), {} as Request, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: msg.serverError });
    expect(JSON.stringify(res.body)).not.toContain('mongodb://');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('Error olmayan değerler de 500 ile karşılanır', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockRes();

    errorHandler('düz metin hata', {} as Request, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: msg.serverError });
    spy.mockRestore();
  });
});
