import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@suzuki/shared';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'suzuki-api',
      timestamp: new Date().toISOString(),
    };
  }
}
