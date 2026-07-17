import { Product } from '../models/Product';
import { User } from '../models/User';

export async function listSellers() {
  const [sellers, counts] = await Promise.all([
    User.find({ role: 'seller' }).select('name').sort({ name: 1 }),
    Product.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: '$sellerId', count: { $sum: 1 } } },
    ]),
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  return sellers.map((s) => ({
    id: String(s._id),
    name: s.name,
    productCount: countById.get(String(s._id)) ?? 0,
  }));
}
