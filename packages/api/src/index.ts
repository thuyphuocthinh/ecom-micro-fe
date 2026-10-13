import { createApiClient } from "./client";

/** The client every app uses: it shares one login through `session`. */
export const api = createApiClient();

export {
  createApiClient,
  type ApiClient,
  type ApiClientConfig,
} from "./client";
export {
  session,
  createSession,
  type Session,
  type TokenPair,
} from "./session";
export { ApiError, CLIENT_ERROR_CODES } from "./errors";
export { createIdempotencyKey } from "./idempotency";
export type {
  ApiResult,
  ApiSuccess,
  PageMeta,
  RequestOptions,
  ApiPath,
  ResponseData,
} from "./types";
export type { paths, components } from "./generated/schema";
