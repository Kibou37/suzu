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
import { blogApi, type BlogPost, type BlogPostInput } from '@/lib/admin-api';

const emptyForm: BlogPostInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  isPublished: false,
};

export function BlogAdminPanel() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setItems(await blogApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(item: BlogPost) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? '',
      content: item.content,
      coverImage: item.coverImage ?? '',
      isPublished: item.isPublished,
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
      if (editingId) {
        await blogApi.update(editingId, form);
      } else {
        await blogApi.create(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return;
    try {
      await blogApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="News & blog"
        description="Create and publish articles for the public blog section."
      />

      {error && <AdminAlert message={error} />}

      <AdminPanel title={editingId ? 'Edit blog post' : 'Create blog post'}>
        <AdminForm onSubmit={handleSubmit} className="admin-form--stacked">
          <AdminFormSection title="Article content" description="Title and body shown on the blog page." columns={2}>
            <AdminField label="Title" fullWidth>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="URL slug (optional)" fullWidth>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Generated automatically if empty"
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="Excerpt" fullWidth>
              <input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="Article body" fullWidth>
              <textarea
                required
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="admin-field__textarea"
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Cover & publishing" description="Hero image and publication status." columns={1}>
            <AdminImageUpload
              label="Cover image"
              hint="Used on the blog listing and article header."
              value={form.coverImage ?? ''}
              onChange={(coverImage) => setForm({ ...form, coverImage })}
              folder="blog"
            />

            <AdminCheckboxField
              label="Published"
              checked={form.isPublished}
              onChange={(checked) => setForm({ ...form, isPublished: checked })}
            />
          </AdminFormSection>

          <AdminFormActions>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {editingId ? 'Save changes' : 'Add blog post'}
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
        <AdminEmpty>Loading blog posts…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No blog posts yet.</AdminEmpty>
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
                  <AdminBadge variant={item.isPublished ? 'success' : 'muted'}>
                    {item.isPublished ? 'Published' : 'Draft'}
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
