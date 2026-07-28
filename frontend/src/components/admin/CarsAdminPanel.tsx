'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AdminImageGallery } from '@/components/admin/AdminImageUpload';
import {
  AdminAlert,
  AdminBadge,
  AdminCheckboxField,
  AdminEmpty,
  AdminField,
  AdminForm,
  AdminFormActions,
  AdminFormNote,
  AdminFormSection,
  AdminLinkButton,
  AdminPageActions,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
} from '@/components/admin/AdminUi';
import { carsApi, type AdminCar, type AdminCarInput } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';

const conditions: AdminCarInput['condition'][] = ['NEW', 'USED'];
const bodyTypes: AdminCarInput['bodyType'][] = ['SEDAN', 'SUV', 'HATCHBACK', 'CROSSOVER', 'PICKUP'];
const fuelTypes: AdminCarInput['fuelType'][] = ['PETROL', 'DIESEL', 'HYBRID'];
const transmissions: AdminCarInput['transmission'][] = ['MANUAL', 'AUTOMATIC', 'CVT'];

type FormState = Omit<AdminCarInput, 'images'> & { images: string[] };

const emptyForm: FormState = {
  name: '',
  slug: '',
  condition: 'NEW',
  year: new Date().getFullYear(),
  price: 0,
  bodyType: 'SUV',
  fuelType: 'PETROL',
  transmission: 'AUTOMATIC',
  trim: '',
  description: '',
  mileage: 0,
  horsepower: undefined,
  isFeatured: false,
  isOffer: false,
  offerLabel: '',
  images: [],
  variantName: '',
};

export function CarsAdminPanel() {
  const [items, setItems] = useState<AdminCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVariants, setEditingVariants] = useState<AdminCar['variants']>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setItems(await carsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setEditingVariants([]);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function startEdit(car: AdminCar) {
    setEditingId(car.id);
    setEditingVariants(car.variants);
    setForm({
      name: car.name,
      slug: car.slug,
      condition: car.condition,
      year: car.year,
      price: Number(car.price),
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      transmission: car.transmission,
      trim: car.trim ?? '',
      description: car.description ?? '',
      mileage: car.mileage,
      horsepower: car.horsepower ?? undefined,
      isFeatured: car.isFeatured,
      isOffer: car.isOffer,
      offerLabel: car.offerLabel ?? '',
      images: [...car.images],
      variantName: '',
    });
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setEditingVariants([]);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const { images, ...rest } = form;
    const payload: AdminCarInput = {
      ...rest,
      images,
    };

    try {
      if (editingId) {
        await carsApi.update(editingId, payload);
      } else {
        await carsApi.create(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save car');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this model? This action cannot be undone.')) return;
    try {
      await carsApi.remove(id);
      if (editingId === id) closeForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete car');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Catalog models"
        description="Manage vehicle listings, pricing, photos, and offer badges on the public catalog."
      />

      <AdminPageActions>
        {!showForm && (
          <button type="button" className="btn btn-primary" onClick={openCreateForm}>
            Add model
          </button>
        )}
      </AdminPageActions>

      {error && <AdminAlert message={error} />}

      {showForm && (
        <AdminPanel
          title={editingId ? 'Edit model' : 'Add model'}
          description="Complete each section below. Uploaded photos appear on the catalog immediately after saving."
        >
          <AdminForm onSubmit={handleSubmit} className="admin-form--stacked">
            <AdminFormSection
              title="Basic information"
              description="Core model details shown on catalog cards and detail pages."
            >
              <AdminField label="Model name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-field__input"
                />
              </AdminField>

              <AdminField label="Trim">
                <input
                  value={form.trim}
                  onChange={(e) => setForm({ ...form, trim: e.target.value })}
                  placeholder="e.g. GLX"
                  className="admin-field__input"
                />
              </AdminField>

              <AdminField label="URL slug (optional)">
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Generated automatically if empty"
                  className="admin-field__input"
                />
              </AdminField>

              <AdminField label="Condition">
                <select
                  value={form.condition}
                  onChange={(e) =>
                    setForm({ ...form, condition: e.target.value as FormState['condition'] })
                  }
                  className="admin-field__select"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c === 'NEW' ? 'New' : 'Used'}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Model year">
                <input
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="admin-field__input"
                />
              </AdminField>

              <AdminField label="Description" fullWidth>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-field__textarea"
                />
              </AdminField>
            </AdminFormSection>

            <AdminFormSection
              title="Pricing & availability"
              description="List price and inventory-related fields."
              columns={2}
            >
              <AdminField label="List price (USD)">
                <input
                  type="number"
                  required
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="admin-field__input"
                />
              </AdminField>

              <AdminField label="Mileage (km)">
                <input
                  type="number"
                  min={0}
                  value={form.mileage}
                  onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })}
                  className="admin-field__input"
                />
              </AdminField>

              {!editingId && (
                <AdminField label="Configurator variant (optional)" fullWidth>
                  <input
                    value={form.variantName}
                    onChange={(e) => setForm({ ...form, variantName: e.target.value })}
                    placeholder="Creates the first configurator trim, e.g. GLX"
                    className="admin-field__input"
                  />
                </AdminField>
              )}

              {editingId && editingVariants.length > 0 && (
                <AdminFormNote>
                  Configurator variants:{' '}
                  {editingVariants.map((v) => `${v.name} (${formatPrice(v.basePrice)})`).join(', ')}.
                  Variant editing is not available in the admin UI yet.
                </AdminFormNote>
              )}
            </AdminFormSection>

            <AdminFormSection
              title="Specifications"
              description="Technical attributes used in catalog filters."
            >
              <AdminField label="Body type">
                <select
                  value={form.bodyType}
                  onChange={(e) =>
                    setForm({ ...form, bodyType: e.target.value as FormState['bodyType'] })
                  }
                  className="admin-field__select"
                >
                  {bodyTypes.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Fuel type">
                <select
                  value={form.fuelType}
                  onChange={(e) =>
                    setForm({ ...form, fuelType: e.target.value as FormState['fuelType'] })
                  }
                  className="admin-field__select"
                >
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Transmission">
                <select
                  value={form.transmission}
                  onChange={(e) =>
                    setForm({ ...form, transmission: e.target.value as FormState['transmission'] })
                  }
                  className="admin-field__select"
                >
                  {transmissions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Horsepower">
                <input
                  type="number"
                  min={0}
                  value={form.horsepower ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      horsepower: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="admin-field__input"
                />
              </AdminField>
            </AdminFormSection>

            <AdminFormSection
              title="Photos"
              description="Upload catalog and gallery images. The first photo is used as the main listing image."
              columns={1}
            >
              <AdminImageGallery
                label="Model photos"
                hint="Supported formats: JPG, PNG, WebP. Maximum file size: 5 MB."
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
                folder="cars"
              />
            </AdminFormSection>

            <AdminFormSection
              title="Visibility & offers"
              description="Highlight models on the homepage or mark them as special offers."
              columns={2}
            >
              <AdminCheckboxField
                label="Featured model"
                checked={form.isFeatured}
                onChange={(checked) => setForm({ ...form, isFeatured: checked })}
              />

              <AdminCheckboxField
                label="Special offer"
                checked={form.isOffer}
                onChange={(checked) => setForm({ ...form, isOffer: checked })}
              />

              {form.isOffer && (
                <AdminField label="Offer badge label" fullWidth>
                  <input
                    value={form.offerLabel}
                    onChange={(e) => setForm({ ...form, offerLabel: e.target.value })}
                    placeholder="e.g. -10%"
                    className="admin-field__input"
                  />
                </AdminField>
              )}
            </AdminFormSection>

            <AdminFormActions>
              <button type="submit" disabled={isSaving} className="btn btn-primary">
                {editingId ? 'Save changes' : 'Add model'}
              </button>
              <button type="button" onClick={closeForm} className="btn btn-secondary">
                Cancel
              </button>
            </AdminFormActions>
          </AdminForm>
        </AdminPanel>
      )}

      {isLoading ? (
        <AdminEmpty>Loading catalog models…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No catalog models yet. Use “Add model” to create the first entry.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Model</th>
              <th>Year</th>
              <th>Price</th>
              <th>Condition</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((car) => (
              <tr key={car.id}>
                <td className="admin-table__primary">
                  {car.name}
                  {car.trim ? ` (${car.trim})` : ''}
                  {car.isOffer && (
                    <span className="admin-table__badge-wrap">
                      <AdminBadge variant="danger">{car.offerLabel || 'Offer'}</AdminBadge>
                    </span>
                  )}
                </td>
                <td>{car.year}</td>
                <td>{formatPrice(car.price)}</td>
                <td>{car.condition === 'NEW' ? 'New' : 'Used'}</td>
                <td>{car.images.length}</td>
                <td className="admin-table__actions">
                  <AdminLinkButton onClick={() => startEdit(car)}>Edit</AdminLinkButton>
                  <AdminLinkButton variant="danger" onClick={() => handleDelete(car.id)}>
                    Delete
                  </AdminLinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
