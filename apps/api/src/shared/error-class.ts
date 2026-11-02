export const getErrorClass = (error: unknown): string =>
  error instanceof Error ? error.constructor.name : typeof error;
