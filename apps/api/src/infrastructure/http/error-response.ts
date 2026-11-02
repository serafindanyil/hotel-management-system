import type { ErrorCode } from '../../shared/error-code.js';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}
