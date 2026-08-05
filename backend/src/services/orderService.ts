import { msg } from '../i18n';
import { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { Cart } from '../models/Cart';
import { Order, OrderDoc, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { findAddress } from './addressService';

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
    address: o.address ? { title: o.address.title, text: o.address.text } : undefined,
    totalPrice: o.totalPrice,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export async function createOrder(userId: string, addressId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, msg.userNotFound);
  const selected = await findAddress(user, addressId);
  const address = { title: selected.title, text: selected.text };

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
    existing.address = address;
    existing.totalPrice = totalPrice;
    existing.status = 'PENDING_PAYMENT';
    await existing.save();
    return toPublicOrder(existing);
  }

  const order = await Order.create({
    userId,
    items,
    address,
    totalPrice,
    status: 'PENDING_PAYMENT',
  });
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

function toSellerOrder(order: OrderDoc, sellerId: string) {
  const pub = toPublicOrder(order);
  const items = pub.items.filter((i) => i.sellerId === sellerId);
  return {
    id: pub.id,
    status: pub.status,
    createdAt: pub.createdAt,
    address: pub.address,
    items,
    sellerTotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

export async function listSellerOrders(sellerId: string) {
  const orders = await Order.find({
    'items.sellerId': sellerId,
    status: { $nin: ['PENDING_PAYMENT', 'PAYMENT_FAILED'] },
  }).sort({ createdAt: -1 });
  return orders.map((o) => toSellerOrder(o, sellerId));
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

export async function updateOrderStatus(
  orderId: string,
  sellerId: string,
  status: OrderStatus,
) {
  if (!Types.ObjectId.isValid(orderId)) throw new ApiError(404, msg.orderNotFound);
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, msg.orderNotFound);
  if (!order.items.some((i) => String(i.sellerId) === sellerId)) {
    throw new ApiError(403, msg.orderNotForSeller);
  }
  if (NEXT_STATUS[order.status] !== status) {
    throw new ApiError(400, msg.invalidStatusTransition);
  }
  order.status = status;
  await order.save();
  return toSellerOrder(order, sellerId);
}
