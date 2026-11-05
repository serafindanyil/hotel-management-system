import type { ExecutionContext } from '@nestjs/common';
import type { Role } from '../domain/role.js';
import type { VerifiedIdentity } from '../domain/verified-identity.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

import { createParamDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'identity:isPublic';
export const ALLOWS_UNSYNCED_KEY = 'identity:allowsUnsynced';
export const ROLES_KEY = 'identity:roles';

// Opens the endpoint to callers without a token.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Admits a verified caller who has no user record yet.
export const AllowUnsynced = () => SetMetadata(ALLOWS_UNSYNCED_KEY, true);

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentIdentity = createParamDecorator(
  (_data: unknown, context: ExecutionContext): VerifiedIdentity | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().identity,
);
