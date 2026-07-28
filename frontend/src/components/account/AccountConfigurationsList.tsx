'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import {
  deleteConfiguration,
  fetchMyConfigurations,
  type SavedConfiguration,
} from '@/lib/configurations';
import { formatPrice } from '@/lib/format';

export function AccountConfigurationsList() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadItems = () => {
    setLoading(true);
    setError(null);

    fetchMyConfigurations()
      .then(setItems)
      .catch(() => setError('Unable to load saved configurations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (item: SavedConfiguration) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Delete saved configuration for Suzuki ${item.modelName}?`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setError(null);

    try {
      await deleteConfiguration(item.id, user.id, item.carSlug);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete configuration.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="account-panel__empty">Loading saved configurations…</p>;
  }

  if (error && items.length === 0) {
    return <p className="account-panel__empty">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="account-panel__empty">
        <p>No saved configurations yet.</p>
        <Link href="/catalog" className="btn btn-secondary">
          Browse models
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="conversion-form__message conversion-form__message--error">{error}</p>
      )}
      <ul className="account-configurations">
        {items.map((item) => {
          const params = new URLSearchParams();
          params.set('model', item.carSlug);
          if (item.bodyColorId) params.set('body', item.bodyColorId);
          if (item.interiorColorId) params.set('interior', item.interiorColorId);
          if (item.selectedOptions.length > 0) {
            params.set('options', item.selectedOptions.join(','));
          }
          params.set('configId', item.id);

          const snap = (item.snapshot ?? {}) as Record<string, unknown>;
          const bodyColorName = typeof snap.bodyColorName === 'string' ? snap.bodyColorName : null;
          const interiorColorName = typeof snap.interiorColorName === 'string' ? snap.interiorColorName : null;
          const optionNames = Array.isArray(snap.optionNames)
            ? (snap.optionNames as string[]).slice(0, 3)
            : [];

          return (
            <li key={item.id} className="account-configurations__item">
              <div className="account-configurations__main">
                <p className="account-configurations__title">
                  Suzuki {item.modelName}
                  {item.trim ? ` · ${item.trim}` : ''}
                </p>
                {(bodyColorName || interiorColorName || optionNames.length > 0) && (
                  <p className="account-configurations__params">
                    {[bodyColorName, interiorColorName, ...optionNames].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="account-configurations__meta">
                  Saved {new Date(item.createdAt).toLocaleDateString('en-GB')}
                  {item.totalPrice > 0 ? ` · ${formatPrice(item.totalPrice)}` : ''}
                </p>
              </div>
              <div className="account-configurations__actions">
                <div className="account-configurations__actions-left">
                  <Link
                    href={`/configurator?${params.toString()}`}
                    className="btn btn-secondary"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary account-item__danger"
                    disabled={deletingId === item.id}
                    onClick={() => void handleDelete(item)}
                  >
                    {deletingId === item.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                <Link href={`/test-drive?${params.toString()}`} className="btn btn-primary">
                  Book test drive
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
