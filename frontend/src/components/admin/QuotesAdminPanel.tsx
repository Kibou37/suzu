'use client';

import { useEffect, useState } from 'react';
import {
  AdminAlert,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminToolbar,
  adminStatusSelectClass,
  formatAdminDate,
} from '@/components/admin/AdminUi';
import { quotesApi, type AdminQuote, type QuoteStatus } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';

const statusLabels: Record<QuoteStatus, string> = {
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  CLOSED: 'Closed',
};

const allStatuses: QuoteStatus[] = ['PENDING', 'CONTACTED', 'CLOSED'];

const contactLabels: Record<AdminQuote['contactMethod'], string> = {
  PHONE: 'Phone',
  EMAIL: 'Email',
  EITHER: 'Either',
};

export function QuotesAdminPanel() {
  const [items, setItems] = useState<AdminQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');

  async function load() {
    setIsLoading(true);
    try {
      setItems(await quotesApi.list(statusFilter || undefined));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote requests');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(id: string, status: QuoteStatus) {
    try {
      await quotesApi.updateStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote request');
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Quote requests"
        description="Review configuration quote requests submitted from the configurator."
      />

      {error && <AdminAlert message={error} />}

      <AdminToolbar>
        <label className="admin-field">
          <span className="admin-field__label">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | '')}
            className="admin-field__select"
          >
            <option value="">All statuses</option>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </AdminToolbar>

      {isLoading ? (
        <AdminEmpty>Loading quote requests…</AdminEmpty>
      ) : items.length === 0 ? (
        <AdminEmpty>No quote requests found.</AdminEmpty>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Date</th>
              <th>Model / total</th>
              <th>Customer</th>
              <th>Dealer / contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((quote) => (
              <tr key={quote.id}>
                <td className="admin-table__primary">{formatAdminDate(quote.createdAt)}</td>
                <td>
                  <div>{quote.modelName}</div>
                  <div className="admin-table__sub">{formatPrice(quote.totalPrice)}</div>
                  <p className="admin-table__sub">{quote.summary}</p>
                </td>
                <td>
                  <div className="admin-table__primary">{quote.customerName}</div>
                  <div>{quote.customerPhone}</div>
                  <div className="admin-table__sub">{quote.customerEmail}</div>
                  {quote.notes && <p className="admin-table__sub">{quote.notes}</p>}
                </td>
                <td>
                  <div>{quote.dealerName}</div>
                  <div className="admin-table__sub">{contactLabels[quote.contactMethod]}</div>
                </td>
                <td>
                  <select
                    value={quote.status}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                    className={adminStatusSelectClass(quote.status)}
                  >
                    {allStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
