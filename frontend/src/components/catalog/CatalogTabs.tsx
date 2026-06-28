import Link from 'next/link';

const catalogTabs = [
  { href: '/catalog', label: 'New' },
  { href: '/catalog/used', label: 'Used' },
  { href: '/catalog/offers', label: 'Offers' },
] as const;

type CatalogTabsProps = {
  active: '/catalog' | '/catalog/used' | '/catalog/offers';
};

export function CatalogTabs({ active }: CatalogTabsProps) {
  return (
    <ul className="catalog-tabs">
      {catalogTabs.map((tab) => (
        <li key={tab.href}>
          <Link href={tab.href} aria-current={active === tab.href ? 'page' : undefined}>
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
