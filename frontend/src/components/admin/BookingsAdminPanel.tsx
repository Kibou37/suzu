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
import { bookingsApi, type AdminBooking, type BookingStatus, type BookingType } from '@/lib/admin-api';

const typeLabels: Record<BookingType, string> = {
  TEST_DRIVE: 'Test drive',
  SERVICE: 'Service',
};

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

const allStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export function BookingsAdminPanel() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<BookingType | ''>('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  async function load() {
    setIsLoading(true);
    try {
      setItems(
        await bookingsApi.list({
          type: typeFilter || undefined,
          status: statusFilter || undefined,
        }),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

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
        title="Bookings"
        description="Review test drive and service appointments submitted through the site."
      />

      {error && <AdminAlert message={error} />}

      <AdminToolbar>
        <AdminFieldSelect
          label="Type"
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as BookingType | '')}
          options={[
            { value: '', label: 'All types' },
            ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
          ]}
        />
        <AdminFieldSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as BookingStatus | '')}
          options={[
            { value: '', label: 'All statuses' },
            ...allStatuses.map((status) => ({ value: status, label: statusLabels[status] })),
          ]}
        />
      </AdminToolbar>

      {isLoading ? (
        <AdminEmpty>Loading bookings…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No bookings found.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Date & time</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Model</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((booking) => (
              <tr key={booking.id}>
                <td className="admin-table__primary">{formatAdminDate(booking.scheduledAt)}</td>
                <td>{typeLabels[booking.type]}</td>
                <td>
                  {booking.customerName}
                  {booking.notes && <p className="admin-table__sub">{booking.notes}</p>}
                </td>
                <td>
                  <div>{booking.customerPhone}</div>
                  {booking.customerEmail && <div className="admin-table__sub">{booking.customerEmail}</div>}
                </td>
                <td>{booking.car?.name ?? '—'}</td>
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

function AdminFieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-field__select"
      >
        {options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
