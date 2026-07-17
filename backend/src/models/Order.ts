import { Document, model, Schema, Types } from 'mongoose';

export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PAYMENT_FAILED',
  'SHIPPED',
  'DELIVERED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDoc extends Document {
  userId: Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
}

const orderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Order = model<OrderDoc>('Order', orderSchema);
