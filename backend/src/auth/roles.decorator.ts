import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restrict a route to specific staff roles. Leave empty to allow any non-customer role. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
