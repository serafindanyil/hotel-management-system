import { DomainError } from './domain-error.js';

export class UpstreamUnavailableError extends DomainError {
  readonly code = 'UPSTREAM_UNAVAILABLE';

  constructor() {
    super('A service the API depends on is unavailable. Please try again.');
  }
}
