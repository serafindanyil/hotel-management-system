const NETWORK_ERROR_MESSAGE = 'The API could not be reached. Please try again.';

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super(NETWORK_ERROR_MESSAGE, { cause });
    this.name = 'NetworkError';
  }
}
