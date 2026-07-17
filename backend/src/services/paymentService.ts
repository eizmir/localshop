import { msg } from '../i18n';
import { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Product } from '../models/Product';
import { removePaidItems } from './cartService';
import { CardInput, processPayment } from './fakePay';
import { toPublicOrder } from './orderService';

export async function payOrder(userId: string, orderId: string, card: CardInput) {
  if (!Types.ObjectId.isValid(orderId)) throw new ApiError(404, msg.orderNotFound);
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, msg.orderNotFound);
  if (String(order.userId) !== userId) throw new ApiError(403, msg.orderForbidden);
  if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAYMENT_FAILED') {
    throw new ApiError(409, msg.alreadyPaid);
  }

  const products = await Product.find({ _id: { $in: order.items.map((i) => i.productId) } });
  const byId = new Map(products.map((p) => [String(p._id), p]));
  for (const item of order.items) {
    const p = byId.get(String(item.productId));
    if (!p || p.stock < item.quantity) {
      throw new ApiError(409, msg.outOfStock(item.name));
    }
  }

  const result = await processPayment(card);

  await Payment.create({
    orderId: order._id,
    status: result.success ? 'SUCCESS' : 'FAILED',
    transactionId: result.transactionId,
  });

  if (result.success) {
    order.status = 'PAID';
    await order.save();
    await Promise.all(
      order.items.map((item) =>
        Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } }),
      ),
    );
    await removePaidItems(userId, order.items.map((i) => i.productId));
  } else {
    order.status = 'PAYMENT_FAILED';
    await order.save();
  }

  return {
    success: result.success,
    message: result.message,
    transactionId: result.transactionId,
    order: toPublicOrder(order),
  };
}
