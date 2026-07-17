import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { productsApi, uploadsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { CATEGORIES } from '../constants/categories';
import type { Category } from '../constants/categories';
import { t } from '../i18n';

export function AddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError('');
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = (await uploadsApi.uploadImage(imageFile)).url;
      }
      await productsApi.create({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl,
      });
      navigate('/seller');
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="card form-card">
      <h1 className="page-title">{t.addProduct.title}</h1>
      <ErrorMessage message={error} />
      <form className="form form-wide" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">{t.addProduct.name}</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor="description">{t.addProduct.description}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>
        <div className="row">
          <div className="field flex-1">
            <label htmlFor="price">{t.addProduct.price}</label>
            <input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="field flex-1">
            <label htmlFor="stock">{t.addProduct.stock}</label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="category">{t.addProduct.category}</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
          >
            <option value="" disabled>
              {t.addProduct.selectCategory}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.categories[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="image">{t.addProduct.image}</label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? t.addProduct.submitting : t.addProduct.submit}
        </button>
      </form>
    </div>
  );
}
