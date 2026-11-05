import type { VerifiedIdentity } from '../domain/verified-identity.js';

import { Injectable } from '@nestjs/common';

import { InvalidTokenError } from '../domain/errors.js';
import { TokenVerifier } from '../domain/token-verifier.js';
import { UserRepository } from '../domain/user-repository.js';
import { UserNotSyncedError } from './user-not-synced-error.js';

@Injectable()
export class AuthenticateCallerHandler {
  constructor(
    private readonly verifier: TokenVerifier,
    private readonly users: UserRepository,
  ) {}

  // Verifies the token and, unless the endpoint admits unsynced callers, requires a user record.
  async execute(token: string | null, requireUser: boolean): Promise<VerifiedIdentity> {
    if (!token) throw new InvalidTokenError();
    const identity = await this.verifier.verify(token);
    if (requireUser && !(await this.users.findByFirebaseUid(identity.firebaseUid))) {
      throw new UserNotSyncedError();
    }
    return identity;
  }
}
