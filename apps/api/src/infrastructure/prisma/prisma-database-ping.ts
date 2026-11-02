import type { DatabasePing } from '../../health/database-ping.js';

import { Injectable, Logger } from '@nestjs/common';
import { setTimeout as delay } from 'node:timers/promises';

import { PrismaService } from './prisma.service.js';

import { getErrorClass } from '../../shared/error-class.js';

const PING_TIMEOUT_MS = 2_000;

class PingTimeoutError extends Error {}

const failAfterTimeout = async (): Promise<never> => {
  await delay(PING_TIMEOUT_MS, undefined, { ref: false });
  throw new PingTimeoutError();
};

@Injectable()
export class PrismaDatabasePing implements DatabasePing {
  private readonly logger = new Logger(PrismaDatabasePing.name);
  private pendingQuery: Promise<unknown> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async isReachable(): Promise<boolean> {
    try {
      await Promise.race([this.getPendingQuery(), failAfterTimeout()]);
      return true;
    } catch (error) {
      this.logger.warn(`Database unreachable: ${getErrorClass(error)}`);
      return false;
    }
  }

  private getPendingQuery(): Promise<unknown> {
    this.pendingQuery ??= this.prisma.$queryRaw`SELECT 1`.finally(() => {
      this.pendingQuery = null;
    });
    return this.pendingQuery;
  }
}
