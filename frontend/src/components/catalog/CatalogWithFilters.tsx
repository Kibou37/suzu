'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { LineupList } from '@/components/catalog/LineupList';
import type { CarListItem } from '@/lib/api';
import {
  applyCatalogFilters,
  getCatalogFilterFacets,
  parseCatalogFilters,
} from '@/lib/catalog-filters';

type CatalogWithFiltersProps = {
  cars: CarListItem[];
  activeTab: '/catalog' | '/catalog/used' | '/catalog/offers';
  showMileage?: boolean;
};

function CatalogWithFiltersContent({
  cars,
  activeTab,
  showMileage = false,
}: CatalogWithFiltersProps) {
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const facets = useMemo(() => getCatalogFilterFacets(cars), [cars]);
  const filteredCars = useMemo(() => {
    const params = new URLSearchParams(filterKey);
    return applyCatalogFilters(cars, parseCatalogFilters(params));
  }, [cars, filterKey]);

  return (
    <>
      <CatalogToolbar activeTab={activeTab} facets={facets} showMileage={showMileage} />

      <p className="catalog-results-count">
        {filteredCars.length} {filteredCars.length === 1 ? 'vehicle' : 'vehicles'} found
      </p>

      <LineupList cars={filteredCars} />
    </>
  );
}

export function CatalogWithFilters(props: CatalogWithFiltersProps) {
  return (
    <Suspense fallback={<LineupList cars={props.cars} />}>
      <CatalogWithFiltersContent {...props} />
    </Suspense>
  );
}
