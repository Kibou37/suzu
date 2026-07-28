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
  AdminPageActions,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
} from '@/components/admin/AdminUi';
import {
  homeBannersApi,
  type HomeBanner,
  type HomeBannerInput,
} from '@/lib/admin-api';

const emptyForm: HomeBannerInput = {
  title: '',
  subtitle: '',
  description: '',
  linkUrl: '/service',
  linkLabel: 'Learn More',
  imageDesktop: '',
  imageMobile: '',
  sortOrder: 0,
  isActive: true,
};

export function HomeBannersAdminPanel() {
  const [items, setItems] = useState<HomeBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<HomeBannerInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setItems(await homeBannersApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: items.length === 0 ? 0 : Math.max(...items.map((item) => item.sortOrder)) + 1,
    });
    setFormOpen(true);
  }

  function startEdit(item: HomeBanner) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      linkUrl: item.linkUrl ?? '',
      linkLabel: item.linkLabel ?? '',
      imageDesktop: item.imageDesktop,
      imageMobile: item.imageMobile ?? '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setFormOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormOpen(false);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.imageDesktop.trim()) {
      setError('Desktop image is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: HomeBannerInput = {
        ...form,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        linkUrl: form.linkUrl || undefined,
        linkLabel: form.linkLabel || undefined,
        imageMobile: form.imageMobile || undefined,
      };

      if (editingId) {
        await homeBannersApi.update(editingId, payload);
      } else {
        await homeBannersApi.create(payload);
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this homepage banner?')) return;
    try {
      await homeBannersApi.remove(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage banners"
        description="Edit hero slides on the homepage. Upload separate images for desktop and mobile."
      />
      {!formOpen && (
        <AdminPageActions>
          <button type="button" className="btn btn-primary" onClick={startCreate}>
            Add banner
          </button>
        </AdminPageActions>
      )}
      {error && <AdminAlert message={error} />}

      {formOpen && (
        <AdminPanel title={editingId ? `Edit banner` : 'Add banner'}>
          <AdminForm onSubmit={handleSubmit} className="admin-form--stacked">
            <AdminFormSection title="Slide content" columns={1}>
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
                />
              </AdminField>

              <AdminField label="Description">
                <textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-field__textarea"
                />
              </AdminField>
            </AdminFormSection>

            <AdminFormSection title="Link & order" columns={2}>
              <AdminField label="Link URL">
                <input
                  value={form.linkUrl ?? ''}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="admin-field__input"
                  placeholder="/service"
                />
              </AdminField>
              <AdminField label="Button label">
                <input
                  value={form.linkLabel ?? ''}
                  onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                  className="admin-field__input"
                  placeholder="Learn More"
                />
              </AdminField>
              <AdminField label="Order">
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder ?? 0}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                  className="admin-field__input"
                />
              </AdminField>
              <AdminCheckboxField
                label="Active on homepage"
                checked={form.isActive ?? true}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </AdminFormSection>

            <AdminFormSection
              title="Images"
              description="Upload a wide desktop banner and an optional mobile crop."
              columns={1}
            >
              <AdminImageUpload
                label="Desktop image"
                hint="Recommended ~2200×900 or wider"
                value={form.imageDesktop}
                onChange={(imageDesktop) => setForm({ ...form, imageDesktop })}
                folder="banners"
              />
              <AdminImageUpload
                label="Mobile image"
                hint="Optional. If empty, desktop image is used on mobile."
                value={form.imageMobile ?? ''}
                onChange={(imageMobile) => setForm({ ...form, imageMobile })}
                folder="banners"
              />
            </AdminFormSection>

            <AdminFormActions>
              <button type="submit" disabled={isSaving} className="btn btn-primary">
                {editingId ? 'Save banner' : 'Add banner'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </AdminFormActions>
          </AdminForm>
        </AdminPanel>
      )}

      {isLoading ? (
        <AdminEmpty>Loading banners…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>
          No homepage banners yet.{' '}
          <AdminLinkButton onClick={startCreate}>Add the first slide</AdminLinkButton>
        </AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>#</th>
              <th>Preview</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="admin-table__primary">{index + 1}</td>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageDesktop}
                    alt=""
                    className="admin-banner-thumb"
                    width={120}
                    height={48}
                  />
                </td>
                <td>
                  {item.title}
                  {item.subtitle && <p className="admin-table__sub">{item.subtitle}</p>}
                </td>
                <td>
                  <AdminBadge variant={item.isActive ? 'success' : 'muted'}>
                    {item.isActive ? 'Active' : 'Hidden'}
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
