import { DomainError } from '../../../shared/domain-error.js';

export class UserNotSyncedError extends DomainError {
  readonly code = 'UNAUTHENTICATED';

  constructor() {
    super('The signed-in user is not synced yet. Sign in again.');
  }
}
