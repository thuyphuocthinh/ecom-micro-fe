import { ApiError, CLIENT_ERROR_CODES } from "./errors";
import {
  session as sharedSession,
  type Session,
  type TokenPair,
} from "./session";
import type {
  ApiPath,
  ApiResult,
  ApiSuccess,
  CallArgs,
  HttpMethod,
  PageMeta,
  ResponseData,
} from "./types";

export interface ApiClientConfig {
  /** Where the API lives. Relative by default, so the Vite proxy (development) or the front gateway (production) handles it. */
  baseUrl?: string;
  fetch?: typeof fetch;
  session?: Session;
}

interface UntypedOptions {
  params?: Record<string, string | number>;
  query?: Record<string, unknown>;
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** The page handles the failure itself: do not report it to the error listeners. */
  silent?: boolean;
}

/** The same sentence is reported once in this many milliseconds (five calls failing together show one message). */
const REPORT_AGAIN_AFTER_MS = 3000;

/** Only an expired access token is worth renewing: a wrong password or a revoked token will not get better. */
const EXPIRED_TOKEN_CODE = "AUTH-002";

/** A token the backend refuses outright (revoked, or not valid): the login is over, there is nothing to renew. */
const DEAD_TOKEN_CODES = new Set(["AUTH-003", "AUTH-004"]);

function isTokenExpired(
  code: string | undefined,
  message: string | undefined,
): boolean {
  if (code === EXPIRED_TOKEN_CODE) return true;
  if (
    code === "AUTH-004" &&
    typeof message === "string" &&
    message.toLowerCase().includes("expired")
  ) {
    return true;
  }
  return false;
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = (config.baseUrl ?? "/api/v1").replace(/\/+$/, "");
  const session = config.session ?? sharedSession;
  const fetchFn =
    config.fetch ??
    ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));

  // One renewal at a time: calls that expire together wait for the same one
  let renewing: Promise<boolean> | null = null;

  const errorListeners = new Set<(error: ApiError) => void>();
  const reportedAt = new Map<string, number>();
  // Errors that ended the login: the shell already tells the customer about that, so they are not reported again
  const endedSession = new WeakSet<ApiError>();

  /** Tells every listener about a failed call, once per sentence in a short time. A broken listener hurts nobody. */
  function report(error: ApiError): void {
    const now = Date.now();
    for (const [sentence, at] of reportedAt) {
      if (now - at >= REPORT_AGAIN_AFTER_MS) reportedAt.delete(sentence);
    }
    if (reportedAt.has(error.userMessage)) return;
    reportedAt.set(error.userMessage, now);
    for (const listener of [...errorListeners]) {
      try {
        listener(error);
      } catch {
        // The listener's own failure must not change what the call throws
      }
    }
  }

  function onError(listener: (error: ApiError) => void): () => void {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
  }

  function buildUrl(path: string, options: UntypedOptions): string {
    let resolved = path;
    for (const [name, value] of Object.entries(options.params ?? {})) {
      resolved = resolved.replace(
        `{${name}}`,
        encodeURIComponent(String(value)),
      );
    }
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null) continue;
      // The backend reads a list as one comma-separated value: status=PENDING,CONFIRMED
      search.set(name, Array.isArray(value) ? value.join(",") : String(value));
    }
    const queryString = search.toString();
    return `${baseUrl}${resolved}${queryString ? `?${queryString}` : ""}`;
  }

  async function send(
    method: string,
    url: string,
    options: UntypedOptions,
    accessToken: string | null,
  ): Promise<Response> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (options.idempotencyKey)
      headers["Idempotency-Key"] = options.idempotencyKey;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (options.body !== undefined && !isFormData)
      headers["Content-Type"] = "application/json";

    try {
      return await fetchFn(url, {
        method: method.toUpperCase(),
        headers,
        body:
          options.body === undefined
            ? undefined
            : isFormData
              ? (options.body as BodyInit)
              : JSON.stringify(options.body),
        signal: options.signal,
      });
    } catch (cause) {
      // The page cancelled the call: that is not a failure of the network
      if (cause instanceof DOMException && cause.name === "AbortError")
        throw cause;
      throw new ApiError({
        status: 0,
        code: CLIENT_ERROR_CODES.NETWORK,
        message: "Could not reach the server",
      });
    }
  }

  async function readJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new ApiError({
        status: response.status,
        code: CLIENT_ERROR_CODES.BAD_RESPONSE,
        message: "The server answered with something that is not JSON",
      });
    }
  }

  function toApiError(response: Response, body: unknown): ApiError {
    const error = (body && typeof body === "object" ? body : {}) as Record<
      string,
      unknown
    >;
    const retryAfter = Number(response.headers.get("Retry-After"));
    return new ApiError({
      status: response.status,
      code:
        typeof error.code === "string" ? error.code : `HTTP_${response.status}`,
      message:
        typeof error.message === "string" ? error.message : response.statusText,
      errors: error.errors,
      traceId: typeof error.traceId === "string" ? error.traceId : undefined,
      retryAfterSeconds:
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    });
  }

  /** Trades the refresh token for a new pair. Goes around `request` on purpose: no old token, no renewing loops. */
  async function renewTokens(): Promise<boolean> {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await fetchFn(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const body = (await response.json()) as ApiSuccess<TokenPair>;
      if (!body?.data?.accessToken || !body.data.refreshToken) return false;
      session.set({
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
      });
      return true;
    } catch {
      return false;
    }
  }

  function renewOnce(): Promise<boolean> {
    if (!renewing) {
      renewing = renewTokens()
        .then((renewed) => {
          if (!renewed) {
            session.clear();
            session.notifyExpired();
          }
          return renewed;
        })
        .finally(() => {
          renewing = null;
        });
    }
    return renewing;
  }

  async function perform<T>(
    method: HttpMethod,
    path: string,
    options: UntypedOptions,
  ): Promise<ApiResult<T>> {
    const url = buildUrl(path, options);
    let sentToken = session.getAccessToken();
    let response = await send(method, url, options, sentToken);
    let body = await readJson(response);

    const errorBody = body as { code?: string; message?: string } | null;
    const isExpired =
      response.status === 401 &&
      isTokenExpired(errorBody?.code, errorBody?.message);

    if (isExpired) {
      const firstError = toApiError(response, body);
      if (!(await renewOnce())) {
        endedSession.add(firstError);
        throw firstError;
      }
      // Once only: if the new token is refused too, that is the answer
      sentToken = session.getAccessToken();
      response = await send(method, url, options, sentToken);
      body = await readJson(response);
    }

    if (!response.ok) {
      const error = toApiError(response, body);
      if (
        sentToken &&
        response.status === 401 &&
        DEAD_TOKEN_CODES.has(error.code) &&
        !isTokenExpired(error.code, error.message)
      ) {
        // Only the first call to learn it ends the login; calls that come later already see another token
        if (session.getAccessToken() === sentToken) {
          session.clear();
          session.notifyExpired();
        }
        endedSession.add(error);
      }
      throw error;
    }

    const success = body as ApiSuccess<T>;
    return {
      data: success.data,
      meta: success.meta as PageMeta | undefined,
      replayed: response.headers.get("Idempotency-Replayed") === "true",
    };
  }

  async function request<T>(
    method: HttpMethod,
    path: string,
    options: UntypedOptions,
  ): Promise<ApiResult<T>> {
    try {
      return await perform<T>(method, path, options);
    } catch (error) {
      // A cancelled call is not an ApiError, so it is never reported
      if (
        error instanceof ApiError &&
        !options.silent &&
        !endedSession.has(error)
      ) {
        report(error);
      }
      throw error;
    }
  }

  function call<M extends HttpMethod>(method: M) {
    return <P extends ApiPath<M>>(
      path: P,
      ...args: CallArgs<P, M>
    ): Promise<ApiResult<ResponseData<P, M>>> =>
      request(method, path, (args[0] ?? {}) as UntypedOptions);
  }

  return {
    get: call("get"),
    post: call("post"),
    put: call("put"),
    patch: call("patch"),
    delete: call("delete"),
    /** Every failed call of every app comes here (one listener, usually the shell's toast). Returns a function that stops listening. */
    onError,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
