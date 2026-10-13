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
}

/** Only an expired access token is worth renewing: a wrong password or a revoked token will not get better. */
const EXPIRED_TOKEN_CODE = "AUTH-002";

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = (config.baseUrl ?? "/api/v1").replace(/\/+$/, "");
  const session = config.session ?? sharedSession;
  const fetchFn =
    config.fetch ??
    ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));

  // One renewal at a time: calls that expire together wait for the same one
  let renewing: Promise<boolean> | null = null;

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
    if (options.body !== undefined)
      headers["Content-Type"] = "application/json";

    try {
      return await fetchFn(url, {
        method: method.toUpperCase(),
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
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

  async function request<T>(
    method: HttpMethod,
    path: string,
    options: UntypedOptions,
  ): Promise<ApiResult<T>> {
    const url = buildUrl(path, options);
    let response = await send(method, url, options, session.getAccessToken());
    let body = await readJson(response);

    if (
      response.status === 401 &&
      (body as { code?: string } | null)?.code === EXPIRED_TOKEN_CODE
    ) {
      const firstError = toApiError(response, body);
      if (!(await renewOnce())) throw firstError;
      // Once only: if the new token is refused too, that is the answer
      response = await send(method, url, options, session.getAccessToken());
      body = await readJson(response);
    }

    if (!response.ok) throw toApiError(response, body);

    const success = body as ApiSuccess<T>;
    return {
      data: success.data,
      meta: success.meta as PageMeta | undefined,
      replayed: response.headers.get("Idempotency-Replayed") === "true",
    };
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
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
