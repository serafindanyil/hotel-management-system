import type { Request } from 'express';
import type { VerifiedIdentity } from '../domain/verified-identity.js';

export type AuthenticatedRequest = Request & { identity?: VerifiedIdentity };
