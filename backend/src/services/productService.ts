import { msg } from '../i18n';
import { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { Product, ProductDoc } from '../models/Product';
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '../validators/product';

export function toPublicProduct(p: ProductDoc) {
  return {
    id: String(p._id),
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    imageUrl: p.imageUrl,
    sellerId: String(p.sellerId),
    createdAt: p.createdAt,
  };
}

export async function listProducts(query: ListProductsQuery) {
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.sellerId) filter.sellerId = query.sellerId;
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = { $regex: escaped, $options: 'i' };
  }
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Product.countDocuments(filter),
  ]);
  return {
    items: items.map(toPublicProduct),
    total,
    page: query.page,
    pages: Math.ceil(total / query.limit) || 1,
  };
}

export async function getProduct(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, msg.productNotFound);
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, msg.productNotFound);
  return toPublicProduct(product);
}

export async function createProduct(sellerId: string, input: CreateProductInput) {
  const product = await Product.create({ ...input, sellerId });
  return toPublicProduct(product);
}

async function getOwnedProduct(productId: string, sellerId: string): Promise<ProductDoc> {
  if (!Types.ObjectId.isValid(productId)) throw new ApiError(404, msg.productNotFound);
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, msg.productNotFound);
  if (String(product.sellerId) !== sellerId) {
    throw new ApiError(403, msg.productForbidden);
  }
  return product;
}

export async function updateProduct(
  productId: string,
  sellerId: string,
  input: UpdateProductInput,
) {
  const product = await getOwnedProduct(productId, sellerId);
  Object.assign(product, input);
  await product.save();
  return toPublicProduct(product);
}

export async function deleteProduct(productId: string, sellerId: string) {
  const product = await getOwnedProduct(productId, sellerId);
  await product.deleteOne();
}

export async function listSellerProducts(sellerId: string) {
  const items = await Product.find({ sellerId }).sort({ createdAt: -1 });
  return items.map(toPublicProduct);
}
