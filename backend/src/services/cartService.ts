import { msg } from '../i18n';
import { ApiError } from '../middleware/errorHandler';
import { Cart, CartDoc } from '../models/Cart';
import { Product, ProductDoc } from '../models/Product';

async function toPublicCart(cart: CartDoc) {
  const populated = await cart.populate<{ items: { productId: ProductDoc | null; quantity: number }[] }>(
    'items.productId',
  );
  const items = populated.items
    .filter((i) => i.productId !== null)
    .map((i) => {
      const p = i.productId as ProductDoc;
      return {
        productId: String(p._id),
        name: p.name,
        price: p.price,
        stock: p.stock,
        quantity: i.quantity,
        lineTotal: p.price * i.quantity,
      };
    });
  return {
    items,
    totalPrice: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

async function getOrCreateCart(userId: string): Promise<CartDoc> {
  return (
    (await Cart.findOne({ userId })) ?? (await Cart.create({ userId, items: [] }))
  );
}

export async function getCart(userId: string) {
  return toPublicCart(await getOrCreateCart(userId));
}

export async function addItem(userId: string, productId: string, quantity: number) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, msg.productNotFound);

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => String(i.productId) === productId);
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (newQuantity > product.stock) {
    throw new ApiError(400, msg.insufficientStockAdd(product.stock));
  }
  if (existing) existing.quantity = newQuantity;
  else cart.items.push({ productId: product._id as never, quantity });
  await cart.save();
  return toPublicCart(cart);
}

export async function updateItem(userId: string, productId: string, quantity: number) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, msg.productNotFound);
  if (quantity > product.stock) {
    throw new ApiError(400, msg.insufficientStockSet(product.stock));
  }
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => String(i.productId) === productId);
  if (!item) throw new ApiError(404, msg.cartItemNotFound);
  item.quantity = quantity;
  await cart.save();
  return toPublicCart(cart);
}

export async function removeItem(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => String(i.productId) !== productId);
  if (cart.items.length === before) throw new ApiError(404, msg.cartItemNotFound);
  await cart.save();
  return toPublicCart(cart);
}

export async function removePaidItems(userId: string, productIds: unknown[]): Promise<void> {
  await Cart.updateOne(
    { userId },
    { $pull: { items: { productId: { $in: productIds } } } },
  );
}
