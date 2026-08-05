import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { productsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { ProductForm } from '../components/ProductForm';
import { Spinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';
import type { Product } from '../types';

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    productsApi
      .get(id)
      .then(setProduct)
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!product) return <Spinner />;

  return (
    <div className="card form-card">
      <h1 className="page-title">{t.editProduct.title}</h1>
      <ProductForm
        initial={product}
        submitLabel={t.editProduct.submit}
        onSubmit={async (values) => {
          await productsApi.update(product.id, values);
          toast.show(t.editProduct.saved);
          navigate('/seller');
        }}
      />
    </div>
  );
}
