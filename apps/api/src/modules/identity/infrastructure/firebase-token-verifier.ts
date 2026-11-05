import type { Auth, DecodedIdToken } from 'firebase-admin/auth';
import type { TokenVerifier } from '../domain/token-verifier.js';
import type { VerifiedIdentity } from '../domain/verified-identity.js';

import { Inject, Injectable } from '@nestjs/common';

import { Email } from '../domain/email.js';
import { InvalidTokenError } from '../domain/errors.js';
import { Role } from '../domain/role.js';
import { FIREBASE_AUTH } from './firebase-admin.provider.js';

import { UpstreamUnavailableError } from '../../../shared/upstream-unavailable-error.js';

const KEY_FETCH_TIMEOUT_MS = 10_000;
const ROLE_CLAIM = 'role';

// firebase-admin reports a failed signing-key fetch as auth/argument-error, the code a bad token
// also gets; only the message tells them apart. A network failure carries the HTTP client's
// "Error while making request" message, and an error reply from Google "Error fetching public keys".
// Both prefixes were checked against firebase-admin 14.5.1; recheck them when upgrading it.
const KEY_FETCH_FAILURE_PREFIXES = ['Error while making request', 'Error fetching public keys'];

const isKeyFetchFailure = (error: unknown): boolean =>
  error instanceof Error &&
  KEY_FETCH_FAILURE_PREFIXES.some((prefix) => error.message.startsWith(prefix));

const translateVerifyError = (error: unknown): Error => {
  if (error instanceof UpstreamUnavailableError) return error;
  return isKeyFetchFailure(error) ? new UpstreamUnavailableError() : new InvalidTokenError();
};

const readEmail = (decoded: DecodedIdToken): Email => {
  if (!decoded.email) throw new InvalidTokenError();
  try {
    return Email.of(decoded.email);
  } catch {
    throw new InvalidTokenError();
  }
};

const toVerifiedIdentity = (decoded: DecodedIdToken): VerifiedIdentity => ({
  firebaseUid: decoded.uid,
  email: readEmail(decoded),
  emailVerified: decoded.email_verified === true,
  displayName: typeof decoded.name === 'string' ? decoded.name : null,
  role: Role.fromClaim(decoded[ROLE_CLAIM]),
});

@Injectable()
export class FirebaseTokenVerifier implements TokenVerifier {
  constructor(@Inject(FIREBASE_AUTH) private readonly auth: Auth) {}

  async verify(token: string): Promise<VerifiedIdentity> {
    return toVerifiedIdentity(await this.verifyWithinTimeout(token));
  }

  // The SDK sets no deadline on the key fetch, so a dropped route would hang the request.
  private async verifyWithinTimeout(token: string): Promise<DecodedIdToken> {
    let timer: NodeJS.Timeout | undefined;
    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new UpstreamUnavailableError()), KEY_FETCH_TIMEOUT_MS);
    });
    try {
      return await Promise.race([this.auth.verifyIdToken(token), deadline]);
    } catch (error) {
      throw translateVerifyError(error);
    } finally {
      clearTimeout(timer);
    }
  }
}
