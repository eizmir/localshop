import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/services';
import { ProductForm } from '../components/ProductForm';
import { t } from '../i18n';

export function AddProduct() {
  const navigate = useNavigate();

  return (
    <div className="card form-card">
      <h1 className="page-title">{t.addProduct.title}</h1>
      <ProductForm
        submitLabel={t.addProduct.submit}
        onSubmit={async (values) => {
          await productsApi.create(values);
          navigate('/seller');
        }}
      />
    </div>
  );
}
