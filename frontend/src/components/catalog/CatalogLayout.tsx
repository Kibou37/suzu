import type { ReactNode } from 'react';
import { CatalogTabs } from '@/components/catalog/CatalogTabs';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';

type CatalogLayoutProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  activeTab: '/catalog' | '/catalog/used' | '/catalog/offers';
  children: ReactNode;
};

export function CatalogLayout({ title, breadcrumbs, activeTab, children }: CatalogLayoutProps) {
  return (
    <div className="catalog-page">
      <div className="container-suzuki">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="catalog-page__title">{title}</h1>
        <CatalogTabs active={activeTab} />
        {children}
      </div>
    </div>
  );
}
