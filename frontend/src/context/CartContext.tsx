import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cartApi } from '../api/services';
import type { Cart, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  count: number;
  items: CartItem[];
  quantityOf: (productId: string) => number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const apply = useCallback((cart: Cart) => setItems(cart.items), []);

  const refresh = useCallback(async () => {
    try {
      apply(await cartApi.get());
    } catch {
      setItems([]);
    }
  }, [apply]);

  useEffect(() => {
    if (user?.role === 'customer') void refresh();
    else setItems([]);
  }, [user, refresh]);

  const quantityOf = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      apply(await cartApi.addItem(productId, quantity));
    },
    [apply],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      apply(
        quantity < 1
          ? await cartApi.removeItem(productId)
          : await cartApi.updateItem(productId, quantity),
      );
    },
    [apply],
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ count, items, quantityOf, refresh, addItem, setQuantity }),
    [count, items, quantityOf, refresh, addItem, setQuantity],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalı');
  return ctx;
}
