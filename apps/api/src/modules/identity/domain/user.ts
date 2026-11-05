import type { Email } from './email.js';
import type { VerifiedIdentity } from './verified-identity.js';

import { randomUUID } from 'node:crypto';

export interface UserSnapshot {
  id: string;
  firebaseUid: string;
  email: Email | null;
  displayName: string | null;
}

// The record keeps an email only while the token marks it verified.
const storedEmailOf = (identity: VerifiedIdentity): Email | null =>
  identity.emailVerified ? identity.email : null;

const isSameEmail = (current: Email | null, next: Email | null): boolean =>
  current === null ? next === null : current.equals(next);

export class User {
  private constructor(
    readonly id: string,
    readonly firebaseUid: string,
    private currentEmail: Email | null,
    private currentDisplayName: string | null,
  ) {}

  static register(identity: VerifiedIdentity): User {
    return new User(
      randomUUID(),
      identity.firebaseUid,
      storedEmailOf(identity),
      identity.displayName,
    );
  }

  static restore(snapshot: UserSnapshot): User {
    return new User(snapshot.id, snapshot.firebaseUid, snapshot.email, snapshot.displayName);
  }

  get email(): Email | null {
    return this.currentEmail;
  }

  get displayName(): string | null {
    return this.currentDisplayName;
  }

  // Applies the token's email and name; reports whether anything changed, so sync writes only then.
  syncFrom(identity: VerifiedIdentity): boolean {
    const email = storedEmailOf(identity);
    const changed =
      !isSameEmail(this.currentEmail, email) || this.currentDisplayName !== identity.displayName;
    this.currentEmail = email;
    this.currentDisplayName = identity.displayName;
    return changed;
  }
}
