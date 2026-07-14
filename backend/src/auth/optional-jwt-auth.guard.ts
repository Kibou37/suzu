import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: unknown; headers: { authorization?: string } }>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.slice(7);

    try {
      request.user = this.authService.verifyAccessToken(token);
    } catch {
      // Ignore invalid token for optional auth on public booking endpoints.
    }

    return true;
  }
}
