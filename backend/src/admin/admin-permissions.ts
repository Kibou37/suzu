import { Role } from '@prisma/client';

/** Staff roles that may enter /admin at all */
export const STAFF_ROLES: Role[] = [
  Role.ADMIN,
  Role.CONTENT_MANAGER,
  Role.DEALER_MANAGER,
];

/** Full catalog write (create/update/delete cars) */
export const CATALOG_WRITE_ROLES: Role[] = [Role.ADMIN];

/** Read catalog */
export const CATALOG_READ_ROLES: Role[] = STAFF_ROLES;

/** Full content write (blog, FAQ, promotions, banners, media upload/delete) */
export const CONTENT_WRITE_ROLES: Role[] = [Role.ADMIN, Role.CONTENT_MANAGER];

/** Read content */
export const CONTENT_READ_ROLES: Role[] = STAFF_ROLES;

/** Bookings, quotes, service slots */
export const OPERATIONS_ROLES: Role[] = [Role.ADMIN, Role.DEALER_MANAGER];

/** Staff users settings */
export const SETTINGS_ROLES: Role[] = [Role.ADMIN];
