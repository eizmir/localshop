import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cart, User } from '../types';

vi.mock('../api/services', () => ({
  cartApi: {
    get: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

let currentUser: User | null = null;
vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: currentUser, loading: false, signIn: vi.fn(), signOut: vi.fn() }),
}));

const { cartApi } = await import('../api/services');
const { CartProvider, useCart } = await import('./CartContext');

const cartWith = (...items: { productId: string; quantity: number }[]): Cart => ({
  items: items.map((i) => ({
    productId: i.productId,
    name: `Ürün ${i.productId}`,
    price: 100,
    stock: 50,
    quantity: i.quantity,
    lineTotal: 100 * i.quantity,
  })),
  totalPrice: items.reduce((sum, i) => sum + 100 * i.quantity, 0),
});

const müşteri = { id: 'u1', role: 'customer' } as User;
const satıcı = { id: 'u2', role: 'seller' } as User;

// Context değerlerini teste taşıyan yardımcı
let cart: ReturnType<typeof useCart>;
function Probe() {
  cart = useCart();
  return <span data-testid="count">{cart.count}</span>;
}

function renderCart() {
  return render(
    <CartProvider>
      <Probe />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  beforeEach(() => {
    currentUser = null;
    vi.mocked(cartApi.get).mockReset();
    vi.mocked(cartApi.addItem).mockReset();
    vi.mocked(cartApi.updateItem).mockReset();
    vi.mocked(cartApi.removeItem).mockReset();
  });

  it('giriş yapılmamışken sepeti sunucudan istemez', () => {
    renderCart();
    expect(cartApi.get).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('satıcı rolü için sepet yüklenmez', () => {
    currentUser = satıcı;
    renderCart();
    expect(cartApi.get).not.toHaveBeenCalled();
  });

  it('müşteri girişinde sepeti yükler ve toplam adedi hesaplar', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockResolvedValue(
      cartWith({ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 3 }),
    );

    renderCart();

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('5'));
  });

  it('sepet isteği başarısız olursa boş sepete düşer', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockRejectedValue(new Error('ağ hatası'));

    renderCart();

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
    expect(cart.items).toEqual([]);
  });

  it('quantityOf sepetteki adedi, olmayan üründe 0 döner', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockResolvedValue(cartWith({ productId: 'p1', quantity: 4 }));

    renderCart();

    await waitFor(() => expect(cart.quantityOf('p1')).toBe(4));
    expect(cart.quantityOf('bilinmeyen')).toBe(0);
  });

  it('addItem sunucunun döndürdüğü sepeti uygular', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockResolvedValue(cartWith());
    vi.mocked(cartApi.addItem).mockResolvedValue(cartWith({ productId: 'p1', quantity: 1 }));

    renderCart();
    await waitFor(() => expect(cartApi.get).toHaveBeenCalled());

    await act(() => cart.addItem('p1', 1));

    expect(cartApi.addItem).toHaveBeenCalledWith('p1', 1);
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('setQuantity 1 ve üzeri için updateItem çağırır', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockResolvedValue(cartWith({ productId: 'p1', quantity: 1 }));
    vi.mocked(cartApi.updateItem).mockResolvedValue(cartWith({ productId: 'p1', quantity: 3 }));

    renderCart();
    await waitFor(() => expect(cartApi.get).toHaveBeenCalled());

    await act(() => cart.setQuantity('p1', 3));

    expect(cartApi.updateItem).toHaveBeenCalledWith('p1', 3);
    expect(cartApi.removeItem).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('setQuantity 0 verildiğinde ürünü sepetten kaldırır', async () => {
    currentUser = müşteri;
    vi.mocked(cartApi.get).mockResolvedValue(cartWith({ productId: 'p1', quantity: 1 }));
    vi.mocked(cartApi.removeItem).mockResolvedValue(cartWith());

    renderCart();
    await waitFor(() => expect(cartApi.get).toHaveBeenCalled());

    await act(() => cart.setQuantity('p1', 0));

    expect(cartApi.removeItem).toHaveBeenCalledWith('p1');
    expect(cartApi.updateItem).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('provider dışında kullanım anlaşılır hata verir', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/CartProvider içinde kullanılmalı/);
    spy.mockRestore();
  });
});
