import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { HealthModule } from './health/health.module.js';

import { DomainErrorFilter } from './infrastructure/http/domain-error.filter.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';

import { validateEnvironment } from './config/validate-environment.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnvironment }),
    PrismaModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}
