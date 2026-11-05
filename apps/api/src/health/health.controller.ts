import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';

import { Public } from '../modules/identity/index.js';

import { DatabasePing } from './database-ping.js';
import { HealthResponse } from './health.response.js';

type StatusSetter = { status(code: number): unknown };

const HEALTH_OK: HealthResponse = { status: 'ok' };
const HEALTH_UNAVAILABLE: HealthResponse = { status: 'unavailable' };

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly databasePing: DatabasePing) {}

  @Get()
  @ApiOkResponse({ type: HealthResponse, description: 'The database answered.' })
  @ApiServiceUnavailableResponse({
    type: HealthResponse,
    description: 'The database did not answer.',
  })
  async check(@Res({ passthrough: true }) response: StatusSetter): Promise<HealthResponse> {
    if (await this.databasePing.isReachable()) return HEALTH_OK;
    response.status(HttpStatus.SERVICE_UNAVAILABLE);
    return HEALTH_UNAVAILABLE;
  }
}
