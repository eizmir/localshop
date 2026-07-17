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
import { useAuth } from './AuthContext';

interface CartContextValue {
    count: number;
    refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const cart = await cartApi.get();
      setCount(cart.items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'customer') void refresh();
    else setCount(0);
  }, [user, refresh]);

  const value = useMemo(() => ({ count, refresh }), [count, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalı');
  return ctx;
}
