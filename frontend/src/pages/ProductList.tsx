import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { productsApi, sellersApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import { CATEGORIES } from '../constants/categories';
import { t } from '../i18n';
import type { ProductList as ProductListData, Seller } from '../types';

export function ProductList() {
  const [data, setData] = useState<ProductListData | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const sellerId = searchParams.get('satici') ?? '';
  const activeSeller = sellers.find((s) => s.id === sellerId);

  useEffect(() => {
    sellersApi.list().then(setSellers).catch(() => setSellers([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      productsApi
        .list({
          category: category || undefined,
          search: search || undefined,
          sellerId: sellerId || undefined,
          page,
        })
        .then(setData)
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search, sellerId, page]);

  function selectSeller(id: string) {
    setPage(1);
    setSearchParams(id ? { satici: id } : {});
  }

  return (
    <>
      <div className="row spread">
        <h1 className="page-title">
          {activeSeller ? t.productList.sellerProducts(activeSeller.name) : t.productList.title}
        </h1>
        <div className="row">
          <input
            placeholder={t.productList.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label={t.addProduct.category}
          >
            <option value="">{t.productList.allCategories}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.categories[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sellers.length > 0 && (
        <div className="seller-section">
          <h2 className="seller-section-title">{t.productList.sellersTitle}</h2>
          <div className="seller-chips">
            {sellers.map((s) => (
              <button
                key={s.id}
                className={`seller-chip ${s.id === sellerId ? 'active' : ''}`}
                onClick={() => selectSeller(s.id === sellerId ? '' : s.id)}
              >
                {s.name}
                <span className="seller-chip-count">{t.productList.productCount(s.productCount)}</span>
              </button>
            ))}
            {sellerId && (
              <button className="btn btn-ghost btn-sm" onClick={() => selectSeller('')}>
                {t.productList.clearSeller}
              </button>
            )}
          </div>
        </div>
      )}

      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {data.pages > 1 && (
            <div className="row pager">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {t.productList.prev}
              </button>
              <span className="muted">{t.productList.pageOf(data.page, data.pages)}</span>
              <button
                className="btn btn-sm"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                {t.productList.next}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="muted">{t.productList.empty}</p>
      )}
    </>
  );
}
