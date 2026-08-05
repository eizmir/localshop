import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../i18n';
import type { Product, SellerOrder } from '../types';

vi.mock('../api/services', () => ({
  productsApi: { mine: vi.fn(), remove: vi.fn(), update: vi.fn() },
  ordersApi: { listForSeller: vi.fn(), updateStatus: vi.fn() },
}));

const toastShow = vi.fn();
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ show: toastShow }) }));

const { ordersApi, productsApi } = await import('../api/services');
const { SellerDashboard } = await import('./SellerDashboard');

const ürün: Product = {
  id: 'p1',
  name: 'Organik Domates Salçası 650 g',
  description: 'Organik tarım ile yetiştirilen domateslerden.',
  price: 210,
  stock: 35,
  category: 'gida',
  imageUrl: '/uploads/salca.jpg',
  sellerId: 's1',
  createdAt: '2026-08-05T10:00:00Z',
};

function sipariş(status: SellerOrder['status']): SellerOrder {
  return {
    id: 'o1',
    status,
    createdAt: '2026-08-05T10:00:00Z',
    address: { title: 'Ofis', text: 'Konak / İzmir' },
    items: [
      { productId: 'p1', sellerId: 's1', name: ürün.name, price: 210, quantity: 2, lineTotal: 420 },
    ],
    sellerTotal: 420,
  };
}

function renderPanel() {
  return render(
    <MemoryRouter>
      <SellerDashboard />
    </MemoryRouter>,
  );
}

describe('SellerDashboard — ürün listesi', () => {
  beforeEach(() => {
    vi.mocked(productsApi.mine).mockReset().mockResolvedValue([ürün]);
    vi.mocked(ordersApi.listForSeller).mockReset().mockResolvedValue([]);
    vi.mocked(ordersApi.updateStatus).mockReset();
    toastShow.mockReset();
  });

  it('ürünü fotoğrafıyla birlikte listeler', async () => {
    renderPanel();
    expect(await screen.findByRole('img', { name: ürün.name })).toBeInTheDocument();
  });

  it('her ürün için düzenleme bağlantısı verir', async () => {
    renderPanel();
    const link = await screen.findByRole('link', { name: t.seller.editOf(ürün.name) });
    expect(link).toHaveAttribute('href', '/seller/products/p1/edit');
  });
});

describe('SellerDashboard — gelen siparişler', () => {
  beforeEach(() => {
    vi.mocked(productsApi.mine).mockReset().mockResolvedValue([]);
    vi.mocked(ordersApi.listForSeller).mockReset();
    vi.mocked(ordersApi.updateStatus).mockReset();
    toastShow.mockReset();
  });

  it('siparişin teslimat adresini gösterir', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('PAID')]);

    renderPanel();

    expect(
      await screen.findByText(t.seller.deliveryTo('Ofis', 'Konak / İzmir')),
    ).toBeInTheDocument();
  });

  it('ödenmiş siparişte Kargoya Ver butonu çıkar', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('PAID')]);

    renderPanel();

    expect(
      await screen.findByRole('button', { name: t.seller.markShipped }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: t.seller.markDelivered }),
    ).not.toBeInTheDocument();
  });

  it('kargodaki siparişte teslim butonu çıkar', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('SHIPPED')]);

    renderPanel();

    expect(
      await screen.findByRole('button', { name: t.seller.markDelivered }),
    ).toBeInTheDocument();
  });

  it('teslim edilmiş siparişte aksiyon butonu kalmaz', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('DELIVERED')]);

    renderPanel();

    await screen.findByText(t.seller.sellerShare('420'));
    expect(screen.queryByRole('button', { name: t.seller.markShipped })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.seller.markDelivered })).not.toBeInTheDocument();
  });

  it('Kargoya Ver durumu ilerletir ve kartı günceller', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('PAID')]);
    vi.mocked(ordersApi.updateStatus).mockResolvedValue(sipariş('SHIPPED'));

    renderPanel();
    await userEvent.click(await screen.findByRole('button', { name: t.seller.markShipped }));

    expect(ordersApi.updateStatus).toHaveBeenCalledWith('o1', 'SHIPPED');
    expect(
      await screen.findByRole('button', { name: t.seller.markDelivered }),
    ).toBeInTheDocument();
    await waitFor(() => expect(toastShow).toHaveBeenCalledWith(t.seller.statusUpdated));
  });

  it('durum güncellemesi başarısız olursa hata gösterir ve durum değişmez', async () => {
    vi.mocked(ordersApi.listForSeller).mockResolvedValue([sipariş('PAID')]);
    vi.mocked(ordersApi.updateStatus).mockRejectedValue(new Error('ağ hatası'));

    renderPanel();
    await userEvent.click(await screen.findByRole('button', { name: t.seller.markShipped }));

    expect(await screen.findByRole('alert')).toHaveTextContent(t.errors.generic);
    expect(screen.getByRole('button', { name: t.seller.markShipped })).toBeInTheDocument();
    expect(toastShow).not.toHaveBeenCalled();
  });
});
