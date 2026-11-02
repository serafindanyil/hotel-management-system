import type { EnvironmentVariables } from './config/environment-variables.js';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module.js';

const DEFAULT_PORT = 4000;

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  await app.listen(config.get('PORT', { infer: true }) ?? DEFAULT_PORT);
};

await bootstrap();
