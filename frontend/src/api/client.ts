import axios from 'axios';
import { t } from '../i18n';

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL: BASE_URL });

export function assetUrl(path: string): string {
  return BASE_URL.replace(/\/api$/, '') + path;
}

const TOKEN_KEY = 'localshop_token';

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 429) return t.errors.tooManyRequests;
  }
  return t.errors.generic;
}
