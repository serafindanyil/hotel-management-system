import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ErrorCode } from '../../shared/error-code.js';
import type { ErrorResponse } from './error.response.js';

import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { DomainError } from '../../shared/domain-error.js';
import { getErrorClass } from '../../shared/error-class.js';

type ErrorReply = { status: number; body: ErrorResponse };

const FIRST_SERVER_ERROR_STATUS = 500;

const REPLY_BY_CODE = {
  VALIDATION_FAILED: { status: HttpStatus.BAD_REQUEST, message: 'The request is invalid.' },
  UNAUTHENTICATED: { status: HttpStatus.UNAUTHORIZED, message: 'Sign in to continue.' },
  FORBIDDEN: { status: HttpStatus.FORBIDDEN, message: 'You do not have access to this resource.' },
  NOT_FOUND: { status: HttpStatus.NOT_FOUND, message: 'The requested resource does not exist.' },
  CONFLICT: {
    status: HttpStatus.CONFLICT,
    message: 'The request conflicts with the current state.',
  },
  ROOM_UNAVAILABLE: {
    status: HttpStatus.CONFLICT,
    message: 'The room is not available for these dates.',
  },
  INVALID_BOOKING_STATE: {
    status: HttpStatus.CONFLICT,
    message: 'The booking does not allow this action.',
  },
  RULE_VIOLATED: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'The request breaks a business rule.',
  },
  INTERNAL_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong. Please try again.',
  },
  UPSTREAM_UNAVAILABLE: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'A service the API depends on is unavailable. Please try again.',
  },
} as const satisfies Record<ErrorCode, { status: HttpStatus; message: string }>;

const CODE_BY_HTTP_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'RULE_VIOLATED',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'UPSTREAM_UNAVAILABLE',
};

const resolveHttpCode = (status: number): ErrorCode =>
  CODE_BY_HTTP_STATUS[status] ??
  (status < FIRST_SERVER_ERROR_STATUS ? 'VALIDATION_FAILED' : 'INTERNAL_ERROR');

const resolveCode = (exception: unknown): ErrorCode => {
  if (exception instanceof DomainError) return exception.code;
  if (exception instanceof HttpException) return resolveHttpCode(exception.getStatus());
  return 'INTERNAL_ERROR';
};

const resolveMessage = (exception: unknown, code: ErrorCode): string =>
  exception instanceof DomainError && code !== 'INTERNAL_ERROR'
    ? exception.message
    : REPLY_BY_CODE[code].message;

@Catch()
export class DomainErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const reply = this.mapException(exception, http.getRequest<Request>());
    http.getResponse<Response>().status(reply.status).json(reply.body);
  }

  private mapException(exception: unknown, request: Request): ErrorReply {
    const code = resolveCode(exception);
    const status: number = REPLY_BY_CODE[code].status;
    if (status >= FIRST_SERVER_ERROR_STATUS) {
      this.logger.error(
        `${code}: ${getErrorClass(exception)} on ${request.method} ${request.path}`,
      );
    }
    return { status, body: { code, message: resolveMessage(exception, code) } };
  }
}
