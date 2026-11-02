import helmet from 'helmet';

import type { EnvironmentVariables } from './config/environment-variables.js';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module.js';

import { parseCorsOrigins } from './config/cors-origins.js';

const DEFAULT_PORT = 4000;
const API_PREFIX = 'api/v1';
const CORS_ALLOWED_HEADERS = ['authorization', 'content-type'];

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  app.enableShutdownHooks();
  app.use(helmet());
  app.enableCors({
    origin: parseCorsOrigins(config.get('CORS_ORIGINS', { infer: true })),
    allowedHeaders: CORS_ALLOWED_HEADERS,
  });
  app.setGlobalPrefix(API_PREFIX, { exclude: ['health'] });
  await app.listen(config.get('PORT', { infer: true }) ?? DEFAULT_PORT);
};

await bootstrap();
