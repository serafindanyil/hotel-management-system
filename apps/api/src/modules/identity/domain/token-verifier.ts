import type { VerifiedIdentity } from './verified-identity.js';

// Rejects with InvalidTokenError for a token it refuses, and UpstreamUnavailableError when it cannot check one.
export abstract class TokenVerifier {
  abstract verify(token: string): Promise<VerifiedIdentity>;
}
