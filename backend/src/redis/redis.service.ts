import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly enabled: boolean;

  constructor() {
    const url = process.env.REDIS_URL;
    this.enabled = Boolean(url);

    if (!url) {
      this.logger.warn('REDIS_URL not set — cache disabled');
      return;
    }

    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    this.client.connect().catch((error: Error) => {
      this.logger.warn(`Redis unavailable: ${error.message}`);
      this.client?.disconnect();
      this.client = null;
    });
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  isAvailable(): boolean {
    return this.client?.status === 'ready';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || this.client.status !== 'ready') return null;

    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;

    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      /* cache miss on write failure */
    }
  }

  async getRaw(key: string): Promise<string | null> {
    if (!this.client || this.client.status !== 'ready') return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async setRaw(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    if (!this.client || this.client.status !== 'ready') return false;
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    try {
      await this.client.del(key);
    } catch {
      /* best-effort */
    }
  }

  /**
   * Invalidates every cached key starting with `prefix` (e.g. after an admin
   * write). Uses SCAN rather than KEYS — KEYS blocks the whole Redis
   * instance for O(N) over the full keyspace, which is a self-inflicted DoS
   * once the dataset grows.
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.unlink(...keys);
        }
      } while (cursor !== '0');
    } catch {
      /* best-effort invalidation */
    }
  }
}
