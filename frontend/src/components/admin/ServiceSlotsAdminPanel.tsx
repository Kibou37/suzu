'use client';

import { useEffect, useState } from 'react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminLinkButton,
  AdminPageHeader,
  AdminTable,
  AdminToolbar,
  formatAdminDate,
} from '@/components/admin/AdminUi';
import { bookingsApi, type AdminBooking, type BookingStatus } from '@/lib/admin-api';

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const badgeVariant: Record<BookingStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function ServiceSlotsAdminPanel() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  async function load() {
    setIsLoading(true);
    try {
      const rows = await bookingsApi.list({
        type: 'SERVICE',
        status: statusFilter || undefined,
      });
      setItems(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service bookings');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function setStatus(id: string, status: BookingStatus) {
    try {
      await bookingsApi.updateStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Service appointments"
        description="Review service bookings and update their status."
      />

      {error && <AdminAlert message={error} />}

      <AdminToolbar>
        <label className="admin-field">
          <span className="admin-field__label">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            className="admin-field__select"
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </AdminToolbar>

      {isLoading ? (
        <AdminEmpty>Loading service appointments…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No service appointments found.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Date & time</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((booking) => (
              <tr key={booking.id}>
                <td className="admin-table__primary">{formatAdminDate(booking.scheduledAt)}</td>
                <td>{booking.customerName}</td>
                <td>
                  <div>{booking.customerPhone}</div>
                  {booking.customerEmail && <div className="admin-table__sub">{booking.customerEmail}</div>}
                </td>
                <td>{booking.notes ? <p className="admin-table__sub">{booking.notes}</p> : '—'}</td>
                <td>
                  <AdminBadge variant={badgeVariant[booking.status]}>
                    {statusLabels[booking.status]}
                  </AdminBadge>
                </td>
                <td className="admin-table__actions">
                  {booking.status === 'PENDING' && (
                    <>
                      <AdminLinkButton onClick={() => setStatus(booking.id, 'CONFIRMED')}>
                        Confirm
                      </AdminLinkButton>
                      <AdminLinkButton onClick={() => setStatus(booking.id, 'CANCELLED')}>
                        Cancel
                      </AdminLinkButton>
                    </>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <>
                      <AdminLinkButton onClick={() => setStatus(booking.id, 'COMPLETED')}>
                        Complete
                      </AdminLinkButton>
                      <AdminLinkButton onClick={() => setStatus(booking.id, 'CANCELLED')}>
                        Cancel
                      </AdminLinkButton>
                    </>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <AdminLinkButton onClick={() => setStatus(booking.id, 'CANCELLED')}>
                      Cancel
                    </AdminLinkButton>
                  )}
                  {booking.status === 'CANCELLED' && (
                    <AdminLinkButton onClick={() => setStatus(booking.id, 'PENDING')}>
                      Reopen
                    </AdminLinkButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
