import helmet from 'helmet';

import type { EnvironmentVariables } from './config/environment-variables.js';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

import { applyApiPrefix } from './infrastructure/http/api-prefix.js';
import { createOpenApiDocument, OPENAPI_PATH } from './infrastructure/http/openapi-document.js';

import { parseCorsOrigins } from './config/cors-origins.js';

const DEFAULT_PORT = 4000;
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
  applyApiPrefix(app);
  SwaggerModule.setup(OPENAPI_PATH, app, () => createOpenApiDocument(app), {
    ui: false,
    raw: ['json'],
  });
  await app.listen(config.get('PORT', { infer: true }) ?? DEFAULT_PORT);
};

await bootstrap();
