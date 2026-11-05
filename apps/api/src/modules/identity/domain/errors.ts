import { DomainError } from '../../../shared/domain-error.js';

export class InvalidEmailError extends DomainError {
  readonly code = 'VALIDATION_FAILED';

  constructor() {
    super('The email address is invalid.');
  }
}

export class InvalidTokenError extends DomainError {
  readonly code = 'UNAUTHENTICATED';

  constructor() {
    super('Sign in to continue.');
  }
}

export class EmailTakenError extends DomainError {
  readonly code = 'CONFLICT';

  constructor() {
    super('This email belongs to another account.');
  }
}
