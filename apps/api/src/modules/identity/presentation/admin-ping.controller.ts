import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminPingResponse } from './admin-ping.response.js';
import { Roles } from './decorators.js';
import { errorReply } from './error-reply.js';

const PING_OK: AdminPingResponse = { status: 'ok' };

// A manager-only endpoint that changes nothing, so the global guards have one to answer for.
@ApiBearerAuth()
@Controller('admin/ping')
export class AdminPingController {
  @Get()
  @Roles('MANAGER')
  @ApiOkResponse({ type: AdminPingResponse })
  @ApiUnauthorizedResponse(errorReply('Missing or invalid token, or the user is not synced.'))
  @ApiForbiddenResponse(errorReply('The caller is not a manager.'))
  @ApiServiceUnavailableResponse(errorReply('Firebase signing keys are unreachable.'))
  check(): AdminPingResponse {
    return PING_OK;
  }
}
