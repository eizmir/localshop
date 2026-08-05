import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { t } from '../i18n';
import { assetUrl, errorMessage, getToken, setToken } from './client';

function axiosErrorWith(status: number, data?: unknown) {
  const err = new AxiosError('istek hatası');
  err.response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return err;
}

describe('errorMessage', () => {
  it('sunucudan gelen Türkçe mesajı öne çıkarır', () => {
    const err = axiosErrorWith(400, { message: 'Geçersiz telefon numarası' });
    expect(errorMessage(err)).toBe('Geçersiz telefon numarası');
  });

  it('429 için özel hız sınırı mesajı verir', () => {
    expect(errorMessage(axiosErrorWith(429))).toBe(t.errors.tooManyRequests);
  });

  it('mesajsız hata için genel metne düşer', () => {
    expect(errorMessage(axiosErrorWith(500))).toBe(t.errors.generic);
  });

  it('axios dışı hatalarda da genel metne düşer', () => {
    expect(errorMessage(new Error('boom'))).toBe(t.errors.generic);
    expect(errorMessage('düz metin')).toBe(t.errors.generic);
    expect(errorMessage(undefined)).toBe(t.errors.generic);
  });
});

describe('token saklama', () => {
  it('token yazar ve okur', () => {
    setToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
  });

  it('null verildiğinde token silinir', () => {
    setToken('abc.def.ghi');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe('assetUrl', () => {
  it('/api ekini atarak yüklenen dosya adresini kurar', () => {
    expect(assetUrl('/uploads/foto.jpg')).toBe('http://localhost:4000/uploads/foto.jpg');
  });
});
