import { Document, model, Schema, Types } from 'mongoose';

export interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface CartDoc extends Document {
  userId: Types.ObjectId;
  items: CartItem[];
}

const cartSchema = new Schema<CartDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

export const Cart = model<CartDoc>('Cart', cartSchema);
