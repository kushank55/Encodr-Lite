import { getToken } from "@/lib/client/token-store";

// PROVIDED IN FULL. One place that knows how to talk to our API, so no component ever calls
// fetch() directly. It attaches the auth token, and turns a failed response into a thrown ApiError
// (which React Query surfaces as `query.error` / `mutation.error`).

export class ApiError extends Error {
  status: number;
  /**
   * Per-field messages from a 422, keyed by form field name:
   *   { sourceUrl: ["Only http(s) URLs are supported"] }
   * Task 4 maps these back onto the form inputs.
   */
  fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Dispatched when the token is rejected. The auth provider listens and signs the user out. */
export const AUTH_LOGOUT_EVENT = "encodr:logout";

async function toApiError(res: Response): Promise<ApiError> {
  let detail = res.statusText || "Request failed";
  let fieldErrors: Record<string, string[]> | undefined;
  try {
    const body = await res.json();
    if (body?.detail) detail = body.detail;
    if (body?.fieldErrors) fieldErrors = body.fieldErrors;
  } catch {
    /* body wasn't JSON — keep the status text */
  }
  return new ApiError(res.status, detail, fieldErrors);
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (options.body !== undefined) headers["content-type"] = "application/json";

  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
};
