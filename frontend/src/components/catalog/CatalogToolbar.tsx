'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CatalogTabs } from '@/components/catalog/CatalogTabs';
import type { CatalogFilterFacets, CatalogFilters } from '@/lib/catalog-filters';
import {
  buildCatalogFilterQuery,
  countActiveCatalogFilters,
  parseCatalogFilters,
} from '@/lib/catalog-filters';
import {
  formatBodyType,
  formatFuelType,
  formatTransmission,
} from '@/lib/format';

type CatalogToolbarProps = {
  activeTab: '/catalog' | '/catalog/used' | '/catalog/offers';
  facets: CatalogFilterFacets;
  showMileage?: boolean;
};

function emptyFilters(): CatalogFilters {
  return {};
}

export function CatalogToolbar({ activeTab, facets, showMileage = false }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appliedFilters = parseCatalogFilters(searchParams);
  const activeCount = countActiveCatalogFilters(appliedFilters);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogFilters>(appliedFilters);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setDraft(parseCatalogFilters(searchParams));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const applyFilters = (next: CatalogFilters) => {
    const query = buildCatalogFilterQuery(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setOpen(false);
  };

  const setDraftField = (key: keyof CatalogFilters, value: string) => {
    setDraft((current) => {
      const next = { ...current };

      if (value === '') {
        delete next[key];
        return next;
      }

      if (
        key === 'bodyType' ||
        key === 'fuelType' ||
        key === 'transmission' ||
        key === 'trim'
      ) {
        next[key] = value;
        return next;
      }

      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        next[key] = parsed;
      }

      return next;
    });
  };

  return (
    <div className="catalog-toolbar">
      <CatalogTabs active={activeTab} />

      <div className="catalog-filter" ref={menuRef}>
        <button
          type="button"
          className="catalog-filter__trigger"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={toggleMenu}
        >
          Filter
          {activeCount > 0 && <span className="catalog-filter__badge">{activeCount}</span>}
        </button>

        {open && (
          <div className="catalog-filter__menu" role="dialog" aria-label="Filter vehicles">
            <form
              className="catalog-filter__form"
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters(draft);
              }}
            >
              <div className="catalog-filter__fields">
                <div className="catalog-filter__row">
                  <label className="catalog-filter__field">
                    <span className="catalog-filter__label">Price from</span>
                    <input
                      type="number"
                      className="catalog-filter__input"
                      value={draft.minPrice ?? ''}
                      placeholder={facets.priceRange.min ? String(facets.priceRange.min) : undefined}
                      min={0}
                      step={100}
                      onChange={(event) => setDraftField('minPrice', event.target.value)}
                    />
                  </label>

                  <label className="catalog-filter__field">
                    <span className="catalog-filter__label">Price to</span>
                    <input
                      type="number"
                      className="catalog-filter__input"
                      value={draft.maxPrice ?? ''}
                      placeholder={facets.priceRange.max ? String(facets.priceRange.max) : undefined}
                      min={0}
                      step={100}
                      onChange={(event) => setDraftField('maxPrice', event.target.value)}
                    />
                  </label>
                </div>

                <div className="catalog-filter__row">
                  <label className="catalog-filter__field">
                    <span className="catalog-filter__label">Year from</span>
                    <input
                      type="number"
                      className="catalog-filter__input"
                      value={draft.minYear ?? ''}
                      placeholder={facets.yearRange.min ? String(facets.yearRange.min) : undefined}
                      min={1990}
                      max={2100}
                      onChange={(event) => setDraftField('minYear', event.target.value)}
                    />
                  </label>

                  <label className="catalog-filter__field">
                    <span className="catalog-filter__label">Year to</span>
                    <input
                      type="number"
                      className="catalog-filter__input"
                      value={draft.maxYear ?? ''}
                      placeholder={facets.yearRange.max ? String(facets.yearRange.max) : undefined}
                      min={1990}
                      max={2100}
                      onChange={(event) => setDraftField('maxYear', event.target.value)}
                    />
                  </label>
                </div>

                {showMileage && (
                  <label className="catalog-filter__field">
                    <span className="catalog-filter__label">Mileage up to, km</span>
                    <input
                      type="number"
                      className="catalog-filter__input"
                      value={draft.maxMileage ?? ''}
                      placeholder={
                        facets.mileageRange.max ? String(facets.mileageRange.max) : undefined
                      }
                      min={0}
                      step={1000}
                      onChange={(event) => setDraftField('maxMileage', event.target.value)}
                    />
                  </label>
                )}

                <label className="catalog-filter__field">
                  <span className="catalog-filter__label">Body type</span>
                  <select
                    className="catalog-filter__select"
                    value={draft.bodyType ?? ''}
                    onChange={(event) => setDraftField('bodyType', event.target.value)}
                  >
                    <option value="">All</option>
                    {facets.bodyTypes.map((value) => (
                      <option key={value} value={value}>
                        {formatBodyType(value)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="catalog-filter__field">
                  <span className="catalog-filter__label">Engine</span>
                  <select
                    className="catalog-filter__select"
                    value={draft.fuelType ?? ''}
                    onChange={(event) => setDraftField('fuelType', event.target.value)}
                  >
                    <option value="">All</option>
                    {facets.fuelTypes.map((value) => (
                      <option key={value} value={value}>
                        {formatFuelType(value)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="catalog-filter__field">
                  <span className="catalog-filter__label">Transmission</span>
                  <select
                    className="catalog-filter__select"
                    value={draft.transmission ?? ''}
                    onChange={(event) => setDraftField('transmission', event.target.value)}
                  >
                    <option value="">All</option>
                    {facets.transmissions.map((value) => (
                      <option key={value} value={value}>
                        {formatTransmission(value)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="catalog-filter__field">
                  <span className="catalog-filter__label">Trim</span>
                  <select
                    className="catalog-filter__select"
                    value={draft.trim ?? ''}
                    onChange={(event) => setDraftField('trim', event.target.value)}
                  >
                    <option value="">All</option>
                    {facets.trims.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="catalog-filter__actions">
                <button
                  type="button"
                  className="catalog-filter__clear"
                  onClick={() => {
                    setDraft(emptyFilters());
                    applyFilters(emptyFilters());
                  }}
                >
                  Clear
                </button>
                <button type="submit" className="catalog-filter__apply">
                  Show results
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
