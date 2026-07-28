'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AdminImageUpload } from '@/components/admin/AdminImageUpload';
import {
  AdminAlert,
  AdminBadge,
  AdminCheckboxField,
  AdminEmpty,
  AdminField,
  AdminForm,
  AdminFormActions,
  AdminFormSection,
  AdminLinkButton,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
} from '@/components/admin/AdminUi';
import { promotionsApi, type Promotion, type PromotionInput } from '@/lib/admin-api';

const emptyForm: PromotionInput = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  linkUrl: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function PromotionsAdminPanel() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setItems(await promotionsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(item: Promotion) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      linkUrl: item.linkUrl ?? '',
      startsAt: toDateInputValue(item.startsAt),
      endsAt: toDateInputValue(item.endsAt),
      isActive: item.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: PromotionInput = {
        ...form,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      };
      if (editingId) {
        await promotionsApi.update(editingId, payload);
      } else {
        await promotionsApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promotion?')) return;
    try {
      await promotionsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="Manage special offers and promotional campaigns on the site."
      />

      {error && <AdminAlert message={error} />}

      <AdminPanel title={editingId ? 'Edit promotion' : 'Create promotion'}>
        <AdminForm onSubmit={handleSubmit} className="admin-form--stacked">
          <AdminFormSection title="Promotion details" description="Title and summary shown on the homepage slider." columns={1}>
            <AdminField label="Title (eyebrow)">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="Subtitle (headline)">
              <input
                value={form.subtitle ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="admin-field__input"
                placeholder="Special offer"
              />
            </AdminField>

            <AdminField label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-field__textarea"
              />
            </AdminField>

            <AdminField label="Link URL">
              <input
                value={form.linkUrl ?? ''}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="admin-field__input"
                placeholder="/catalog/offers"
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Schedule" description="Optional start and end dates." columns={2}>
            <AdminField label="Start date">
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="End date">
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminCheckboxField
              label="Active"
              checked={form.isActive}
              onChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </AdminFormSection>

          <AdminFormSection title="Promotion image" description="Visual used in promotional blocks." columns={1}>
            <AdminImageUpload
              label="Banner image"
              value={form.image ?? ''}
              onChange={(image) => setForm({ ...form, image })}
              folder="promotions"
            />
          </AdminFormSection>

          <AdminFormActions>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {editingId ? 'Save changes' : 'Add promotion'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </AdminFormActions>
        </AdminForm>
      </AdminPanel>

      {isLoading ? (
        <AdminEmpty>Loading promotions…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No promotions yet.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="admin-table__primary">{item.title}</td>
                <td>
                  <AdminBadge variant={item.isActive ? 'success' : 'muted'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </td>
                <td className="admin-table__actions">
                  <AdminLinkButton onClick={() => startEdit(item)}>Edit</AdminLinkButton>
                  <AdminLinkButton variant="danger" onClick={() => handleDelete(item.id)}>
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
