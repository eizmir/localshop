import { useState } from 'react';
import type { FormEvent } from 'react';
import { assetUrl, errorMessage } from '../api/client';
import { uploadsApi } from '../api/services';
import { ErrorMessage } from './ErrorMessage';
import { CATEGORIES } from '../constants/categories';
import type { Category } from '../constants/categories';
import { t } from '../i18n';
import type { Product } from '../types';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  imageUrl?: string;
}

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [category, setCategory] = useState<Category | ''>(initial?.category ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError('');
    setSaving(true);
    try {
      const imageUrl = imageFile
        ? (await uploadsApi.uploadImage(imageFile)).url
        : initial?.imageUrl;
      await onSubmit({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl,
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <>
      <ErrorMessage message={error} />
      <form className="form form-wide" onSubmit={handleSubmit}>
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
          {initial?.imageUrl && !imageFile && (
            <div className="form-image-preview">
              <img src={assetUrl(initial.imageUrl)} alt={initial.name} />
              <span className="muted">{t.editProduct.currentImage}</span>
            </div>
          )}
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? t.addProduct.submitting : submitLabel}
        </button>
      </form>
    </>
  );
}
