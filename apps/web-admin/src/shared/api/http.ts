import type { z } from 'zod';

import { buildApiError, buildUnexpectedResponseError } from './api-error';
import { getIdToken } from './id-token';
import { NetworkError } from './network-error';
import { createRequestSignal, raceSignal } from './request-signal';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type InputValues = Record<string, unknown>;

export type Endpoint<
  TInput extends z.ZodType = z.ZodType,
  TResponse extends z.ZodType = z.ZodType,
> = {
  method: HttpMethod;
  path: string;
  queryParams: readonly string[];
  input: TInput;
  response: TResponse;
};

export type RequestOptions = { signal?: AbortSignal };

export type EndpointInput<TEndpoint extends Endpoint> = z.input<TEndpoint['input']>;

export type EndpointInputArgs<TEndpoint extends Endpoint> =
  Record<string, never> extends EndpointInput<TEndpoint>
    ? [input?: EndpointInput<TEndpoint>]
    : [input: EndpointInput<TEndpoint>];

export type EndpointArgs<TEndpoint extends Endpoint> = [
  ...EndpointInputArgs<TEndpoint>,
  options?: RequestOptions,
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NO_CONTENT_STATUS = 204;
const JSON_CONTENT_TYPE = 'application/json';
const BODY_KEY = 'body';
const INVALID_BODY = Symbol('invalid body');
const PATH_PARAM_PATTERN = /:([A-Za-z0-9_]+)/g;
const TRAILING_SLASH_PATTERN = /\/+$/;

const isRecord = (value: unknown): value is InputValues =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const resolveBaseUrl = (): string => {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not set');
  return API_URL.replace(TRAILING_SLASH_PATTERN, '');
};

const buildPath = (path: string, values: InputValues): string =>
  path.replace(PATH_PARAM_PATTERN, (_match, name: string) =>
    encodeURIComponent(String(values[name])),
  );

const appendQueryValue = (search: URLSearchParams, name: string, value: unknown): void => {
  if (value === undefined || value === null) return;
  const items: unknown[] = Array.isArray(value) ? value : [value];
  for (const item of items) search.append(name, String(item));
};

const buildQuery = (names: readonly string[], values: InputValues): string => {
  const search = new URLSearchParams();
  for (const name of names) appendQueryValue(search, name, values[name]);
  const query = search.toString();
  return query ? `?${query}` : '';
};

const buildUrl = (endpoint: Endpoint, values: InputValues): string =>
  `${resolveBaseUrl()}${buildPath(endpoint.path, values)}${buildQuery(endpoint.queryParams, values)}`;

const resolveHeaders = async (hasBody: boolean, signal: AbortSignal): Promise<Headers> => {
  const headers = new Headers({ accept: JSON_CONTENT_TYPE });
  if (hasBody) headers.set('content-type', JSON_CONTENT_TYPE);
  const token = await raceSignal(getIdToken(), signal);
  if (token) headers.set('authorization', `Bearer ${token}`);
  return headers;
};

const resolveInit = async (
  endpoint: Endpoint,
  values: InputValues,
  signal: AbortSignal,
): Promise<RequestInit> => {
  const body = values[BODY_KEY];
  const hasBody = body !== undefined;
  return {
    method: endpoint.method.toUpperCase(),
    headers: await resolveHeaders(hasBody, signal),
    body: hasBody ? JSON.stringify(body) : undefined,
    signal,
  };
};

const parseInputValues = (endpoint: Endpoint, input: unknown): InputValues => {
  const values: unknown = endpoint.input.parse(input ?? {});
  return isRecord(values) ? values : {};
};

const sendRequest = async (
  url: string,
  init: RequestInit,
  signal: AbortSignal,
): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw signal.aborted ? signal.reason : new NetworkError(error);
  }
};

const readBody = async (response: Response, signal: AbortSignal): Promise<unknown> => {
  if (response.status === NO_CONTENT_STATUS) return undefined;
  try {
    return await response.json();
  } catch {
    if (signal.aborted) throw signal.reason;
    return INVALID_BODY;
  }
};

const parseResponse = async <TResponse extends z.ZodType>(
  schema: TResponse,
  response: Response,
  signal: AbortSignal,
): Promise<z.output<TResponse>> => {
  const parsed = schema.safeParse(await readBody(response, signal));
  if (!parsed.success) throw buildUnexpectedResponseError(response.status);
  return parsed.data;
};

export const callEndpoint = async <TInput extends z.ZodType, TResponse extends z.ZodType>(
  endpoint: Endpoint<TInput, TResponse>,
  input?: z.input<TInput>,
  options: RequestOptions = {},
): Promise<z.output<TResponse>> => {
  const values = parseInputValues(endpoint, input);
  const request = createRequestSignal(options.signal);
  try {
    const init = await resolveInit(endpoint, values, request.signal);
    const response = await sendRequest(buildUrl(endpoint, values), init, request.signal);
    if (!response.ok) throw await buildApiError(response, request.signal);
    return await parseResponse(endpoint.response, response, request.signal);
  } finally {
    request.release();
  }
};
