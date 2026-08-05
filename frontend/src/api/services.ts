import type {
  Address,
  AuthResponse,
  Cart,
  Order,
  PaymentResponse,
  Product,
  ProductList,
  Role,
  Seller,
  SellerOrder,
  User,
} from '../types';
import { api } from './client';

export const authApi = {
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone: string;
    address?: string;
  }) => api.post<AuthResponse>('/auth/register', input).then((r) => r.data),
  login: (input: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', input).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

export const sellersApi = {
  list: () => api.get<Seller[]>('/sellers').then((r) => r.data),
};

export const productsApi = {
  list: (params: { category?: string; search?: string; sellerId?: string; page?: number }) =>
    api.get<ProductList>('/products', { params }).then((r) => r.data),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (input: Omit<Product, 'id' | 'sellerId' | 'createdAt'>) =>
    api.post<Product>('/products', input).then((r) => r.data),
  update: (id: string, input: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt'>>) =>
    api.put<Product>(`/products/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/products/${id}`),
  mine: () => api.get<Product[]>('/products/seller/me').then((r) => r.data),
};

export const uploadsApi = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ url: string }>('/uploads', form).then((r) => r.data);
  },
};

export const cartApi = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  addItem: (productId: string, quantity: number) =>
    api.post<Cart>('/cart/items', { productId, quantity }).then((r) => r.data),
  updateItem: (productId: string, quantity: number) =>
    api.patch<Cart>(`/cart/items/${productId}`, { quantity }).then((r) => r.data),
  removeItem: (productId: string) =>
    api.delete<Cart>(`/cart/items/${productId}`).then((r) => r.data),
};

export const addressesApi = {
  list: () => api.get<Address[]>('/addresses').then((r) => r.data),
  create: (input: { title: string; text: string }) =>
    api.post<Address>('/addresses', input).then((r) => r.data),
  remove: (id: string) => api.delete<Address[]>(`/addresses/${id}`).then((r) => r.data),
};

export const ordersApi = {
  create: (addressId: string) =>
    api.post<Order>('/orders', { addressId }).then((r) => r.data),
  listMine: () => api.get<Order[]>('/orders').then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  listForSeller: () => api.get<SellerOrder[]>('/orders/seller/me').then((r) => r.data),
  updateStatus: (id: string, status: 'SHIPPED' | 'DELIVERED') =>
    api.patch<SellerOrder>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

export const paymentsApi = {
  pay: (input: {
    orderId: string;
    cardNumber: string;
    cardHolder: string;
    expiry: string;
    cvv: string;
  }) =>
    api
      .post<PaymentResponse>('/payments/pay', input, {
        validateStatus: (s) => s === 200 || s === 402,
      })
      .then((r) => r.data),
};
