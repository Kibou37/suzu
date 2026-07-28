'use client';

import { useEffect, useState } from 'react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
} from '@/components/admin/AdminUi';
import { staffUsersApi, type StaffUser } from '@/lib/admin-api';

const roleLabels: Record<StaffUser['role'], string> = {
  ADMIN: 'Administrator',
  CONTENT_MANAGER: 'Content manager',
  DEALER_MANAGER: 'Dealer manager',
};

export function StaffUsersAdminPanel() {
  const [items, setItems] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    staffUsersApi
      .list()
      .then((rows) => {
        if (!cancelled) {
          setItems(rows);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load staff users');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Staff users"
        description="Read-only list of admin, content and dealer accounts. Invite flow comes later."
      />

      {error && <AdminAlert message={error} />}

      {isLoading ? (
        <AdminEmpty>Loading staff users…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No staff users found.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td className="admin-table__primary">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                </td>
                <td>{user.email}</td>
                <td>
                  <AdminBadge variant={user.role === 'ADMIN' ? 'info' : 'muted'}>
                    {roleLabels[user.role]}
                  </AdminBadge>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
