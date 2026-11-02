import type { ErrorCode } from './error-code.js';

export abstract class DomainError extends Error {
  abstract readonly code: ErrorCode;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
