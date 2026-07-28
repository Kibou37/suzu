import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { AuthUser } from './current-user.decorator';
import { ROLES_KEY } from './roles.decorator';

/**
 * Authorizes staff-only routes. Must run after `JwtAuthGuard`, which
 * populates `request.user`. Any role other than CUSTOMER counts as staff
 * unless a route narrows access further with `@Roles(...)`.
 */
@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user || user.role === Role.CUSTOMER) {
      throw new ForbiddenException('Admin access required');
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
