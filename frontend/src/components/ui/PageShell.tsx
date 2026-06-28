import Link from 'next/link';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
};

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="page-shell__header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      )}
      <h1 className="page-shell__title">{title}</h1>
      {description && <p className="page-shell__desc">{description}</p>}
    </div>
  );
}

type PlaceholderPageProps = PageHeaderProps & {
  children?: ReactNode;
};

export function PlaceholderPage({ title, description, breadcrumbs, children }: PlaceholderPageProps) {
  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
        {children ?? <div className="placeholder-box">This section is under development — coming soon.</div>}
      </div>
    </div>
  );
}
