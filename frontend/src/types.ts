import type { Category } from './constants/categories';

export type Role = 'customer' | 'seller';

export interface Address {
  id: string;
  title: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  addresses: Address[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  imageUrl?: string;
  sellerId: string;
  createdAt: string;
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface Seller {
  id: string;
  name: string;
  productCount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'SHIPPED'
  | 'DELIVERED';

export interface OrderItem {
  productId: string;
  sellerId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  address?: Omit<Address, 'id'>;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface SellerOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  address?: Omit<Address, 'id'>;
  items: OrderItem[];
  sellerTotal: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId: string;
  order: Order;
}
