import { NetworkError } from './network-error';

const REQUEST_TIMEOUT_MS = 10_000;
const TIMEOUT_CAUSE = 'timeout';

type RequestSignal = { signal: AbortSignal; release: () => void };

export const createRequestSignal = (callerSignal?: AbortSignal): RequestSignal => {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new NetworkError(TIMEOUT_CAUSE)),
    REQUEST_TIMEOUT_MS,
  );
  const forwardCallerAbort = (): void => controller.abort(callerSignal?.reason);
  callerSignal?.addEventListener('abort', forwardCallerAbort, { once: true });
  if (callerSignal?.aborted) forwardCallerAbort();
  const release = (): void => {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', forwardCallerAbort);
  };
  return { signal: controller.signal, release };
};

export const raceSignal = <T>(promise: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    if (signal.aborted) reject(signal.reason);
    promise.then(resolve, reject);
  });
