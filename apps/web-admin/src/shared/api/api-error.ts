import { z } from 'zod';

const FIELD_ERROR_SCHEMA = z.object({
  field: z.string(),
  message: z.string(),
});

const ERROR_BODY_SCHEMA = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.array(FIELD_ERROR_SCHEMA).optional(),
  currentStatus: z.string().optional(),
});

type FieldError = z.infer<typeof FIELD_ERROR_SCHEMA>;
type ErrorBody = z.infer<typeof ERROR_BODY_SCHEMA>;

const ERROR_BODY_FALLBACK: ErrorBody = {
  code: 'INTERNAL_ERROR',
  message: 'Something went wrong. Please try again.',
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: FieldError[];
  readonly currentStatus?: string;

  constructor(status: number, body: ErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
    this.currentStatus = body.currentStatus;
  }
}

const parseErrorBody = (body: unknown): ErrorBody => {
  const parsed = ERROR_BODY_SCHEMA.safeParse(body);
  return parsed.success ? parsed.data : ERROR_BODY_FALLBACK;
};

export const buildUnexpectedResponseError = (status: number): ApiError =>
  new ApiError(status, ERROR_BODY_FALLBACK);

const readErrorBody = async (response: Response, signal: AbortSignal): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    if (signal.aborted) throw signal.reason;
    return undefined;
  }
};

export const buildApiError = async (response: Response, signal: AbortSignal): Promise<ApiError> =>
  new ApiError(response.status, parseErrorBody(await readErrorBody(response, signal)));
