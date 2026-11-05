import { DomainError } from './domain-error.js';

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor() {
    super('You do not have access to this resource.');
  }
}
