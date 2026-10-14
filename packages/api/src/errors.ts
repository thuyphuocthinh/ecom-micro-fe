import { userMessageFor } from "./error-messages";

/** Codes that do not come from the backend: the request never got a usable answer. */
export const CLIENT_ERROR_CODES = {
  NETWORK: "NETWORK",
  BAD_RESPONSE: "BAD_RESPONSE",
} as const;

export interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
  errors?: unknown;
  traceId?: string;
  retryAfterSeconds?: number;
}

/**
 * The one error every call throws. `code` is the backend's code (for example "ORD-001") so a page can
 * show the right message; "NETWORK" and "BAD_RESPONSE" mean the request got no usable answer (status 0
 * when nothing came back at all).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors?: unknown;
  readonly traceId?: string;
  /** Seconds to wait before trying again, when the backend said so (429). */
  readonly retryAfterSeconds?: number;
  /** What to tell the customer: friendly Vietnamese, no codes. `message` stays the backend's English for logs. */
  readonly userMessage: string;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.errors = init.errors;
    this.traceId = init.traceId;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.userMessage = userMessageFor(init);
  }
}
