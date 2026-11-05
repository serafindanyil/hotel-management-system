import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Role } from '../domain/role.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './decorators.js';

import { ForbiddenError } from '../../../shared/forbidden-error.js';

// Registered globally after AuthGuard; refuses a caller whose token lacks a role the endpoint names.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const role = context.switchToHttp().getRequest<AuthenticatedRequest>().identity?.role;
    if (!role || !roles.includes(role)) throw new ForbiddenError();
    return true;
  }
}
