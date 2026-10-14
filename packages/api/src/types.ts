import type { paths } from "./generated/schema";

/** The wrapper around every successful backend answer. */
export interface ApiSuccess<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: PageMeta;
}

/**
 * `meta` of a paged answer, as the backend sends it: a cursor list has `nextCursor`; a numbered-page
 * list has `page`, `limit` and `total` (counted only up to a ceiling: `totalCapped` says more match).
 */
export interface PageMeta {
  hasMore: boolean;
  nextCursor?: string | null;
  page?: number;
  limit?: number;
  total?: number;
  totalCapped?: boolean;
}

/** What a call returns to the page. */
export interface ApiResult<T> {
  data: T;
  meta?: PageMeta;
  /** True when the backend replayed the answer of an earlier request with the same Idempotency-Key. */
  replayed: boolean;
}

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/** Every path in the Swagger starts with this; the client already has it in its base URL. */
type Prefix = "/api/v1";

/** The paths (without the prefix) that have the given method. */
export type ApiPath<M extends HttpMethod> = {
  [K in keyof paths]: K extends `${Prefix}${infer P}`
    ? paths[K] extends { [Key in M]: infer Op }
      ? Op extends never
        ? never
        : P
      : never
    : never;
}[keyof paths];

type Operation<
  P extends string,
  M extends HttpMethod,
> = `${Prefix}${P}` extends keyof paths
  ? paths[`${Prefix}${P}`] extends { [Key in M]: infer Op }
    ? Op
    : never
  : never;

type PathParams<Op> = Op extends { parameters: { path: infer T } } ? T : never;
type QueryParams<Op> = Op extends { parameters: { query?: infer T } }
  ? NonNullable<T>
  : never;
type JsonBody<Op> = Op extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

type SuccessContent<Op> = Op extends { responses: infer R }
  ? R extends { 200: { content: { "application/json": infer D } } }
    ? D
    : R extends { 201: { content: { "application/json": infer D } } }
      ? D
      : R extends { 202: { content: { "application/json": infer D } } }
        ? D
        : unknown
  : unknown;

export type ResponseData<
  P extends string,
  M extends HttpMethod,
> = SuccessContent<Operation<P, M>>;

/** `{ key?: value }` is optional as a whole only when every key in it is optional. */
type Optional<K extends string, T> = [T] extends [never]
  ? { [Key in K]?: never }
  : {} extends T
    ? { [Key in K]?: T }
    : { [Key in K]: T };

export type RequestOptions<P extends string, M extends HttpMethod> = Optional<
  "params",
  PathParams<Operation<P, M>>
> &
  Optional<"query", QueryParams<Operation<P, M>>> &
  Optional<"body", JsonBody<Operation<P, M>>> & {
    /** One key per attempt, for placing an order and paying. Keep it the same on every retry. */
    idempotencyKey?: string;
    signal?: AbortSignal;
    /** The page handles the failure itself: the error is not reported to `api.onError`. */
    silent?: boolean;
  };

/** The argument list of a call: the options are required as soon as one of them is. */
export type CallArgs<P extends string, M extends HttpMethod> =
  {} extends RequestOptions<P, M>
    ? [options?: RequestOptions<P, M>]
    : [options: RequestOptions<P, M>];
