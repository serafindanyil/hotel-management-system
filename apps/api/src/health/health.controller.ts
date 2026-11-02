import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

import { DatabasePing } from './database-ping.js';

type HealthResponse = { status: 'ok' | 'unavailable' };
type StatusSetter = { status(code: number): unknown };

const HEALTH_OK: HealthResponse = { status: 'ok' };
const HEALTH_UNAVAILABLE: HealthResponse = { status: 'unavailable' };

@Controller('health')
export class HealthController {
  constructor(private readonly databasePing: DatabasePing) {}

  @Get()
  async check(@Res({ passthrough: true }) response: StatusSetter): Promise<HealthResponse> {
    if (await this.databasePing.isReachable()) return HEALTH_OK;
    response.status(HttpStatus.SERVICE_UNAVAILABLE);
    return HEALTH_UNAVAILABLE;
  }
}
