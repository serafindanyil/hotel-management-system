import type { Email } from './email.js';
import type { Role } from './role.js';

export interface VerifiedIdentity {
  readonly firebaseUid: string;
  readonly email: Email;
  readonly emailVerified: boolean;
  readonly displayName: string | null;
  readonly role: Role;
}
