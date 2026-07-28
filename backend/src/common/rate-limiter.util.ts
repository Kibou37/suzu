/**
 * Sliding-window IP/key rate limiter with periodic cleanup to avoid
 * unbounded memory growth (E16.1.2). One instance per process — under
 * horizontal scaling the effective limit is `max * instanceCount`;
 * move to Redis if that becomes a problem.
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
  ) {
    this.cleanupTimer = setInterval(() => this.cleanup(), windowMs);
    this.cleanupTimer.unref?.();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key);
    }
  }

  /** Returns true if the request is allowed, false if the limit was exceeded. */
  check(key: string): boolean {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.max) return false;
    entry.count += 1;
    return true;
  }

  destroy(): void {
    clearInterval(this.cleanupTimer);
  }
}

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
};

/**
 * Resolves the client IP. `X-Forwarded-For` is only trusted when
 * `TRUST_PROXY=true` — otherwise it is attacker-controlled and trivially
 * spoofable, which would let a client bypass IP-based rate limiting.
 */
export function getClientIp(req: RequestLike): string {
  if (process.env.TRUST_PROXY === 'true') {
    const forwarded = req.headers['x-forwarded-for'];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = value?.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}
