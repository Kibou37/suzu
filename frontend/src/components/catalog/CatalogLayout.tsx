import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';

type CatalogLayoutProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
};

export function CatalogLayout({ title, breadcrumbs, children }: CatalogLayoutProps) {
  return (
    <div className="catalog-page">
      <div className="container-suzuki">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="catalog-page__title">{title}</h1>
        {children}
      </div>
    </div>
  );
}
