'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type AccountLkShellProps = {
  info: ReactNode;
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
};

export function AccountLkShell({ info, children, breadcrumbs }: AccountLkShellProps) {
  return (
    <div className="account-lk">
      <div className="container-suzuki account-lk__container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="account-lk__breadcrumbs breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="account-lk__crumb">
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                {index < breadcrumbs.length - 1 && <span className="account-lk__crumb-sep">/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="account-lk__frames">
          <aside className="account-lk__info">{info}</aside>
          <div className="account-lk__form-panel">{children}</div>
        </div>
      </div>
    </div>
  );
}
