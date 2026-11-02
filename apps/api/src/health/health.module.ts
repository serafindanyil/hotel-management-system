import { Module } from '@nestjs/common';

import { DatabasePing } from './database-ping.js';
import { HealthController } from './health.controller.js';

import { PrismaDatabasePing } from '../infrastructure/prisma/prisma-database-ping.js';

@Module({
  controllers: [HealthController],
  providers: [{ provide: DatabasePing, useClass: PrismaDatabasePing }],
})
export class HealthModule {}
