import { Document, model, Schema, Types } from 'mongoose';
import { CATEGORIES, Category } from '../constants/categories';

export interface ProductDoc extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  imageUrl?: string;
  sellerId: Types.ObjectId;
  createdAt: Date;
}

const productSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    imageUrl: { type: String },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Product = model<ProductDoc>('Product', productSchema);
