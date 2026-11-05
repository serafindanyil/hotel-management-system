import type { User } from './user.js';

export abstract class UserRepository {
  abstract findByFirebaseUid(firebaseUid: string): Promise<User | null>;

  // Stores the user keyed by firebaseUid and returns the stored record, so two parallel first
  // syncs of one person both get the same user. Rejects with EmailTakenError when another record
  // holds the email.
  abstract save(user: User): Promise<User>;
}
