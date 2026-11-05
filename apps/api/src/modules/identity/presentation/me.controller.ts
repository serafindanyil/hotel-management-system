import type { VerifiedIdentity } from '../domain/verified-identity.js';

import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SyncUserHandler } from '../application/sync-user.handler.js';
import { AllowUnsynced, CurrentIdentity } from './decorators.js';
import { errorReply } from './error-reply.js';
import { UserResponse } from './user.response.js';

@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly syncUser: SyncUserHandler) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @AllowUnsynced()
  @ApiOkResponse({ type: UserResponse, description: 'The signed-in user, created on first sync.' })
  @ApiUnauthorizedResponse(errorReply('Missing or invalid token.'))
  @ApiConflictResponse(errorReply('Another account holds the email.'))
  @ApiServiceUnavailableResponse(errorReply('Firebase signing keys are unreachable.'))
  sync(@CurrentIdentity() identity: VerifiedIdentity): Promise<UserResponse> {
    return this.syncUser.execute(identity);
  }
}
