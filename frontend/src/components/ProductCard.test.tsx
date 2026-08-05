import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../i18n';
import type { Product, User } from '../types';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigate };
});

let currentUser: User | null = null;
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: currentUser, loading: false, signIn: vi.fn(), signOut: vi.fn() }),
}));

const addItem = vi.fn();
const setQuantity = vi.fn();
let sepettekiAdet = 0;
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    count: sepettekiAdet,
    items: [],
    quantityOf: () => sepettekiAdet,
    refresh: vi.fn(),
    addItem,
    setQuantity,
  }),
}));

const toastShow = vi.fn();
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ show: toastShow }) }));

const { ProductCard } = await import('./ProductCard');

const ürün: Product = {
  id: 'p1',
  name: 'Organik Ham Kakao Tozu 250 g',
  description: 'Alkalize işlem görmemiş organik ham kakao.',
  price: 275,
  stock: 10,
  category: 'gida',
  imageUrl: '/uploads/kakao.jpg',
  sellerId: 's1',
  createdAt: '2026-08-05T10:00:00Z',
};

function renderCard(overrides: Partial<Product> = {}) {
  return render(
    <MemoryRouter>
      <ProductCard product={{ ...ürün, ...overrides }} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  beforeEach(() => {
    currentUser = null;
    sepettekiAdet = 0;
    navigate.mockReset();
    addItem.mockReset().mockResolvedValue(undefined);
    setQuantity.mockReset().mockResolvedValue(undefined);
    toastShow.mockReset();
  });

  it('ürün adını, fiyatı ve kategoriyi gösterir', () => {
    renderCard();
    expect(screen.getByText(ürün.name)).toBeInTheDocument();
    expect(screen.getByText('275 ₺')).toBeInTheDocument();
    expect(screen.getByText(t.categories.gida)).toBeInTheDocument();
  });

  it('görseli ürün adıyla etiketler', () => {
    renderCard();
    expect(screen.getByRole('img', { name: ürün.name })).toBeInTheDocument();
  });

  it('görseli olmayan üründe yer tutucu gösterir', () => {
    renderCard({ imageUrl: undefined });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('sepette olmayan ürün için Sepete Ekle butonu çıkar', () => {
    renderCard();
    expect(screen.getByRole('button', { name: t.product.addToCart })).toBeInTheDocument();
  });

  it('giriş yapmamış kullanıcıyı sepete eklemeden giriş sayfasına yollar', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.addToCart }));

    expect(navigate).toHaveBeenCalledWith('/login', expect.anything());
    expect(addItem).not.toHaveBeenCalled();
  });

  it('giriş yapmış müşteride sepete ekler ve bildirim gösterir', async () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.addToCart }));

    expect(addItem).toHaveBeenCalledWith('p1', 1);
    expect(toastShow).toHaveBeenCalledWith(t.product.added);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sepetteki ürün için adet kontrolü gösterir', () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    sepettekiAdet = 2;
    renderCard();

    expect(screen.queryByRole('button', { name: t.product.addToCart })).not.toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.product.increase })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.product.decrease })).toBeInTheDocument();
  });

  it('artı butonu adedi bir artırır', async () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    sepettekiAdet = 2;
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.increase }));

    expect(setQuantity).toHaveBeenCalledWith('p1', 3);
  });

  it('eksi butonu adedi bir azaltır', async () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    sepettekiAdet = 2;
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.decrease }));

    expect(setQuantity).toHaveBeenCalledWith('p1', 1);
  });

  it('adet 1 iken eksi ürünü sepetten çıkarır', async () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    sepettekiAdet = 1;
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.decrease }));

    expect(setQuantity).toHaveBeenCalledWith('p1', 0);
  });

  it('stok sınırına gelindiğinde artı butonu kilitlenir', () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    sepettekiAdet = 10; // stok da 10
    renderCard();

    expect(screen.getByRole('button', { name: t.product.increase })).toBeDisabled();
    expect(screen.getByRole('button', { name: t.product.decrease })).toBeEnabled();
  });

  it('stoğu biten üründe buton yerine Tükendi yazar', () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    renderCard({ stock: 0 });

    expect(screen.getByText(t.product.outOfStock)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.product.addToCart })).not.toBeInTheDocument();
  });

  it('satıcıya sepet butonu değil stok bilgisi gösterir', () => {
    currentUser = { id: 's1', role: 'seller' } as User;
    renderCard();

    expect(screen.getByText(t.product.stock(10))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.product.addToCart })).not.toBeInTheDocument();
  });

  it('sepete ekleme başarısız olursa hata mesajı gösterir', async () => {
    currentUser = { id: 'u1', role: 'customer' } as User;
    addItem.mockRejectedValue(new Error('ağ hatası'));
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: t.product.addToCart }));

    expect(await screen.findByText(t.errors.generic)).toBeInTheDocument();
    expect(toastShow).not.toHaveBeenCalled();
  });
});
