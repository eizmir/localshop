import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { msg } from '../i18n';
import { ApiError } from '../middleware/errorHandler';
import { Order } from '../models/Order';
import { listSellerOrders, updateOrderStatus } from './orderService';

// vi.mock çağrıları import'ların üstüne taşınır, bu yüzden yukarıdaki
// statik import mock'lanmış modülü alır.
vi.mock('../models/Order', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../models/Order')>();
  return {
    ...actual,
    Order: { findById: vi.fn(), find: vi.fn() },
  };
});

const SELLER_A = new Types.ObjectId();
const SELLER_B = new Types.ObjectId();

function fakeOrder(status: string, sellerIds: Types.ObjectId[] = [SELLER_A]) {
  return {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    status,
    address: { title: 'Ev', text: 'Urla / İzmir' },
    totalPrice: 300,
    createdAt: new Date('2026-08-05T10:00:00Z'),
    items: sellerIds.map((sellerId, index) => ({
      productId: new Types.ObjectId(),
      sellerId,
      name: `Ürün ${index + 1}`,
      price: 100,
      quantity: index + 1,
    })),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe('updateOrderStatus — durum geçiş kuralları', () => {
  beforeEach(() => vi.mocked(Order.findById).mockReset());

  it('PAID → SHIPPED geçişine izin verir ve kaydeder', async () => {
    const order = fakeOrder('PAID');
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    const result = await updateOrderStatus(
      String(order._id),
      String(SELLER_A),
      'SHIPPED',
    );

    expect(order.status).toBe('SHIPPED');
    expect(order.save).toHaveBeenCalledOnce();
    expect(result.status).toBe('SHIPPED');
  });

  it('SHIPPED → DELIVERED geçişine izin verir', async () => {
    const order = fakeOrder('SHIPPED');
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    const result = await updateOrderStatus(
      String(order._id),
      String(SELLER_A),
      'DELIVERED',
    );

    expect(result.status).toBe('DELIVERED');
  });

  it('PAID → DELIVERED adım atlamasını reddeder', async () => {
    const order = fakeOrder('PAID');
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    await expect(
      updateOrderStatus(String(order._id), String(SELLER_A), 'DELIVERED'),
    ).rejects.toMatchObject({ status: 400, message: msg.invalidStatusTransition });
    expect(order.save).not.toHaveBeenCalled();
  });

  it('DELIVERED durumundan geri dönüşü reddeder', async () => {
    const order = fakeOrder('DELIVERED');
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    await expect(
      updateOrderStatus(String(order._id), String(SELLER_A), 'SHIPPED'),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('ödenmemiş siparişin durumu ilerletilemez', async () => {
    for (const status of ['PENDING_PAYMENT', 'PAYMENT_FAILED']) {
      const order = fakeOrder(status);
      vi.mocked(Order.findById).mockResolvedValue(order as never);

      await expect(
        updateOrderStatus(String(order._id), String(SELLER_A), 'SHIPPED'),
      ).rejects.toMatchObject({ status: 400 });
    }
  });

  it('siparişte ürünü olmayan satıcıya 403 verir', async () => {
    const order = fakeOrder('PAID', [SELLER_A]);
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    await expect(
      updateOrderStatus(String(order._id), String(SELLER_B), 'SHIPPED'),
    ).rejects.toMatchObject({ status: 403, message: msg.orderNotForSeller });
    expect(order.save).not.toHaveBeenCalled();
  });

  it('yetki kontrolü durum kontrolünden önce yapılır', async () => {
    // Yanlış satıcı + geçersiz geçiş: 400 değil 403 dönmeli ki
    // yabancı bir satıcı siparişin durumunu öğrenemesin.
    const order = fakeOrder('DELIVERED', [SELLER_A]);
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    await expect(
      updateOrderStatus(String(order._id), String(SELLER_B), 'SHIPPED'),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('geçersiz ObjectId için 404 verir ve veritabanına gitmez', async () => {
    await expect(
      updateOrderStatus('gecersiz-id', String(SELLER_A), 'SHIPPED'),
    ).rejects.toMatchObject({ status: 404, message: msg.orderNotFound });
    expect(Order.findById).not.toHaveBeenCalled();
  });

  it('bulunamayan sipariş için 404 verir', async () => {
    vi.mocked(Order.findById).mockResolvedValue(null as never);

    await expect(
      updateOrderStatus(String(new Types.ObjectId()), String(SELLER_A), 'SHIPPED'),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('updateOrderStatus — satıcı görünümü', () => {
  it('yalnızca satıcının kendi kalemlerini ve payını döndürür', async () => {
    const order = fakeOrder('PAID', [SELLER_A, SELLER_B]);
    vi.mocked(Order.findById).mockResolvedValue(order as never);

    const result = await updateOrderStatus(
      String(order._id),
      String(SELLER_A),
      'SHIPPED',
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.sellerId).toBe(String(SELLER_A));
    expect(result.sellerTotal).toBe(100); // 100 ₺ × 1 adet
    expect(result.address).toEqual({ title: 'Ev', text: 'Urla / İzmir' });
  });
});

describe('listSellerOrders', () => {
  it('her siparişi satıcıya göre daraltır ve payını hesaplar', async () => {
    const order = fakeOrder('PAID', [SELLER_A, SELLER_B]);
    vi.mocked(Order.find).mockReturnValue({
      sort: vi.fn().mockResolvedValue([order]),
    } as never);

    const [result] = await listSellerOrders(String(SELLER_B));

    expect(result?.items).toHaveLength(1);
    expect(result?.items[0]?.name).toBe('Ürün 2');
    expect(result?.sellerTotal).toBe(200); // 100 ₺ × 2 adet
    expect(result?.address?.title).toBe('Ev');
  });

  it('ödeme bekleyen siparişleri sorgudan hariç tutar', async () => {
    const sort = vi.fn().mockResolvedValue([]);
    vi.mocked(Order.find).mockReturnValue({ sort } as never);

    await listSellerOrders(String(SELLER_A));

    expect(Order.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $nin: ['PENDING_PAYMENT', 'PAYMENT_FAILED'] },
      }),
    );
  });
});
