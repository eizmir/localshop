import { Link } from 'react-router-dom';
import { assetUrl } from '../api/client';
import { t } from '../i18n';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={assetUrl(product.imageUrl)} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-image-placeholder">🛍</span>
        )}
      </div>
      <div className="product-card-body">
        <span className="badge">{t.categories[product.category]}</span>
        <h3>{product.name}</h3>
        <p className="muted clamp">{product.description}</p>
      </div>
      <div className="product-card-footer">
        <strong>{product.price.toLocaleString('tr-TR')} ₺</strong>
        <span className={product.stock > 0 ? 'muted' : 'text-danger'}>
          {product.stock > 0 ? t.product.stock(product.stock) : t.product.outOfStock}
        </span>
      </div>
    </Link>
  );
}
