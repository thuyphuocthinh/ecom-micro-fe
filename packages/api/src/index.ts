import { createApiClient } from "./client";

/** The client every app uses: it shares one login through `session`. */
export const api = createApiClient();

export {
  createApiClient,
  type ApiClient,
  type ApiClientConfig,
  type StreamOptions,
} from "./client";
export {
  session,
  createSession,
  type Session,
  type TokenPair,
} from "./session";
export { ApiError, CLIENT_ERROR_CODES } from "./errors";
export { createIdempotencyKey } from "./idempotency";
export { userMessageFor, MESSAGES } from "./error-messages";
export type {
  ApiResult,
  ApiSuccess,
  PageMeta,
  RequestOptions,
  ApiPath,
  ResponseData,
} from "./types";
export type { paths, components } from "./generated/schema";
export { readEventStream, type ServerSentEvent } from "./event-stream";
