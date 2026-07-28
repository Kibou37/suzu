import type { AdminRole } from '@/lib/admin-api';

export type AdminNavSection = 'overview' | 'catalog' | 'content' | 'operations' | 'settings';

const ROLE_SECTIONS: Record<AdminRole, AdminNavSection[]> = {
  ADMIN: ['overview', 'catalog', 'content', 'operations', 'settings'],
  CONTENT_MANAGER: ['overview', 'catalog', 'content'],
  DEALER_MANAGER: ['overview', 'catalog', 'content', 'operations'],
};

const PATH_SECTION: Array<{ prefix: string; section: AdminNavSection }> = [
  { prefix: '/admin/users', section: 'settings' },
  { prefix: '/admin/cars', section: 'catalog' },
  { prefix: '/admin/banners', section: 'content' },
  { prefix: '/admin/media', section: 'content' },
  { prefix: '/admin/blog', section: 'content' },
  { prefix: '/admin/faq', section: 'content' },
  { prefix: '/admin/promotions', section: 'content' },
  { prefix: '/admin/bookings', section: 'operations' },
  { prefix: '/admin/quotes', section: 'operations' },
  { prefix: '/admin/slots', section: 'operations' },
  { prefix: '/admin', section: 'overview' },
];

export function roleCanAccessSection(role: AdminRole, section: AdminNavSection): boolean {
  return ROLE_SECTIONS[role]?.includes(section) ?? false;
}

export function roleCanAccessPath(role: AdminRole, pathname: string): boolean {
  const match = PATH_SECTION.find((item) =>
    item.prefix === '/admin' ? pathname === '/admin' : pathname.startsWith(item.prefix),
  );
  if (!match) return role === 'ADMIN';
  return roleCanAccessSection(role, match.section);
}

export function roleCanWriteCatalog(role: AdminRole): boolean {
  return role === 'ADMIN';
}

export function roleCanWriteContent(role: AdminRole): boolean {
  return role === 'ADMIN' || role === 'CONTENT_MANAGER';
}

export function roleCanManageOperations(role: AdminRole): boolean {
  return role === 'ADMIN' || role === 'DEALER_MANAGER';
}
