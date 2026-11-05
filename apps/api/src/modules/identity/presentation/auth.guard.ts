import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request.js';

import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticateCallerHandler } from '../application/authenticate-caller.handler.js';
import { ALLOWS_UNSYNCED_KEY, IS_PUBLIC_KEY } from './decorators.js';

const BEARER_TOKEN_PATTERN = /^Bearer\s+(\S+)$/i;

const readBearerToken = (request: AuthenticatedRequest): string | null =>
  BEARER_TOKEN_PATTERN.exec(request.headers.authorization ?? '')?.[1] ?? null;

// Registered globally: every endpoint requires a verified token unless it is marked @Public().
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authenticateCaller: AuthenticateCallerHandler,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isMarked(IS_PUBLIC_KEY, context)) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.identity = await this.authenticateCaller.execute(
      readBearerToken(request),
      !this.isMarked(ALLOWS_UNSYNCED_KEY, context),
    );
    return true;
  }

  private isMarked(key: string, context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
