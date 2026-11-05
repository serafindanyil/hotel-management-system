import type { ErrorCode } from '../../shared/error-code.js';

// The Swagger CLI plugin documents these fields from their types (see nest-cli.json).
export class ErrorResponse {
  code: ErrorCode;

  message: string;
}
