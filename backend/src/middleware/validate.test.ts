import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { msg } from '../i18n';
import { validate } from './validate';

const schema = z.object({
  title: z.string().min(2),
  count: z.coerce.number().int(),
});

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
  return res as unknown as Response & {
    statusCode: number;
    body: { message: string; errors: { path: string; message: string }[] };
  };
}

describe('validate', () => {
  it('geçerli body ile next çağrılır', () => {
    const req = { body: { title: 'Ev', count: 3 } } as Request;
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('req.body şemanın parse ettiği veriyle değiştirilir', () => {
    const req = { body: { title: 'Ev', count: '7' } } as Request;
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, mockRes(), next);

    // coerce sayesinde string '7' sayıya dönüşmüş olmalı
    expect(req.body.count).toBe(7);
    expect(typeof req.body.count).toBe('number');
  });

  it('geçersiz body 400 ve alan bazlı hata listesi döner', () => {
    const req = { body: { title: 'E' } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(msg.invalidRequest);
    expect(res.body.errors.map((e) => e.path)).toEqual(
      expect.arrayContaining(['title', 'count']),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('şemada olmayan alanlar body dışında bırakılır', () => {
    const req = { body: { title: 'Ev', count: 1, role: 'seller' } } as Request;
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, mockRes(), next);

    expect(req.body).toEqual({ title: 'Ev', count: 1 });
    expect(req.body.role).toBeUndefined();
  });
});
