'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  AdminAlert,
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
import { faqApi, type FaqInput, type FaqItem } from '@/lib/admin-api';

const emptyForm: FaqInput = { question: '', answer: '', category: '', sortOrder: 0 };

export function FaqAdminPanel() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      setItems(await faqApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category ?? '',
      sortOrder: item.sortOrder,
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
        await faqApi.update(editingId, form);
      } else {
        await faqApi.create(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ entry');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ entry?')) return;
    try {
      await faqApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ entry');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="FAQ"
        description="Manage frequently asked questions shown on the public FAQ page."
      />

      {error && <AdminAlert message={error} />}

      <AdminPanel title={editingId ? 'Edit FAQ entry' : 'Create FAQ entry'}>
        <AdminForm onSubmit={handleSubmit} className="admin-form--stacked">
          <AdminFormSection title="Question & answer" description="Content displayed in the FAQ accordion." columns={1}>
            <AdminField label="Question">
              <input
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="Answer">
              <textarea
                required
                rows={5}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="admin-field__textarea"
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Organization" description="Grouping and display order on the FAQ page." columns={2}>
            <AdminField label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Buying, Service"
                className="admin-field__input"
              />
            </AdminField>

            <AdminField label="Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="admin-field__input"
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormActions>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {editingId ? 'Save changes' : 'Add FAQ entry'}
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
        <AdminEmpty>Loading FAQ entries…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No FAQ entries yet.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="admin-table__primary">{item.question}</td>
                <td>{item.category ?? '—'}</td>
                <td>{item.sortOrder}</td>
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
