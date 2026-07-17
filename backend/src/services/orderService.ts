import { msg } from '../i18n';
import { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { Cart } from '../models/Cart';
import { Order, OrderDoc } from '../models/Order';
import { Product } from '../models/Product';

export function toPublicOrder(o: OrderDoc) {
  return {
    id: String(o._id),
    items: o.items.map((i) => ({
      productId: String(i.productId),
      sellerId: String(i.sellerId),
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.price * i.quantity,
    })),
    totalPrice: o.totalPrice,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export async function createOrder(userId: string) {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new ApiError(400, msg.cartEmpty);

  const products = await Product.find({
    _id: { $in: cart.items.map((i) => i.productId) },
  });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = cart.items.map((ci) => {
    const p = byId.get(String(ci.productId));
    if (!p) throw new ApiError(400, msg.productGone);
    if (ci.quantity > p.stock) {
      throw new ApiError(400, msg.insufficientStockOrder(p.name, p.stock));
    }
    return {
      productId: p._id as Types.ObjectId,
      sellerId: p.sellerId,
      name: p.name,
      price: p.price,
      quantity: ci.quantity,
    };
  });

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const existing = await Order.findOne({
    userId,
    status: { $in: ['PENDING_PAYMENT', 'PAYMENT_FAILED'] },
  });
  if (existing) {
    existing.items = items;
    existing.totalPrice = totalPrice;
    existing.status = 'PENDING_PAYMENT';
    await existing.save();
    return toPublicOrder(existing);
  }

  const order = await Order.create({ userId, items, totalPrice, status: 'PENDING_PAYMENT' });
  return toPublicOrder(order);
}

export async function listMyOrders(userId: string) {
  const orders = await Order.find({
    userId,
    status: { $nin: ['PENDING_PAYMENT', 'PAYMENT_FAILED'] },
  }).sort({ createdAt: -1 });
  return orders.map(toPublicOrder);
}

export async function getOrder(orderId: string, userId: string) {
  if (!Types.ObjectId.isValid(orderId)) throw new ApiError(404, msg.orderNotFound);
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, msg.orderNotFound);
  if (String(order.userId) !== userId) throw new ApiError(403, msg.orderForbidden);
  return toPublicOrder(order);
}

export async function listSellerOrders(sellerId: string) {
  const orders = await Order.find({
    'items.sellerId': sellerId,
    status: { $nin: ['PENDING_PAYMENT', 'PAYMENT_FAILED'] },
  }).sort({ createdAt: -1 });
  return orders.map((o) => {
    const pub = toPublicOrder(o);
    const items = pub.items.filter((i) => i.sellerId === sellerId);
    return {
      id: pub.id,
      status: pub.status,
      createdAt: pub.createdAt,
      items,
      sellerTotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    };
  });
}
