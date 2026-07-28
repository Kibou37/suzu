import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { getClientIp, RateLimiter } from './common/rate-limiter.util';

function assertRequiredEnv(): void {
  // Required in every environment — a missing secret must never silently
  // fall back to a publicly-known dev value (see auth.service.ts).
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set.');
  }
}

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.API_PORT ?? process.env.PORT ?? 4000;

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : 'http://localhost:3000',
    credentials: true,
  });

  // Security headers (E16.1) — no external helmet dependency
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(self)',
    );
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

  // Simple IP rate limit for public API (E16.1.2) — in-memory, per process
  const apiRateLimiter = new RateLimiter(
    60_000,
    Number(process.env.API_RATE_LIMIT_PER_MIN ?? 120),
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!apiRateLimiter.check(getClientIp(req))) {
      res.status(429).json({ statusCode: 429, message: 'Too many requests' });
      return;
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Swagger UI exposes the full API surface (incl. admin routes) — keep it
  // off the public internet by default; opt in explicitly per environment.
  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Suzuki Dealer API')
      .setDescription('REST API for catalog, bookings, auth and account')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    // Optional static export for docs/handover (E18.1.3)
    if (process.env.SWAGGER_EXPORT_PATH?.trim()) {
      const fs = await import('fs');
      const path = await import('path');
      const exportPath = process.env.SWAGGER_EXPORT_PATH.trim();
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
      fs.writeFileSync(exportPath, JSON.stringify(document, null, 2), 'utf8');
      Logger.log(`Swagger JSON written to ${exportPath}`, 'Bootstrap');
    }
  }

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/api`, 'Bootstrap');
  if (swaggerEnabled) {
    Logger.log(`Swagger UI at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

void bootstrap();
