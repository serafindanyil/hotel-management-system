import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AuthGuard, IdentityModule, RolesGuard } from './modules/identity/index.js';

import { HealthModule } from './health/health.module.js';

import { DomainErrorFilter } from './infrastructure/http/domain-error.filter.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';

import { validateEnvironment } from './config/validate-environment.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnvironment }),
    PrismaModule,
    IdentityModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    // AuthGuard runs first, so RolesGuard reads the role it puts on the request.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
