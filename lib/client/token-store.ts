// PROVIDED IN FULL. Where the auth token lives on the client.
//
// It's kept outside React on purpose: the plain `api` wrapper in api.ts needs to read the token,
// and it can't call a React hook. localStorage survives a page refresh; the module-level variable
// is just a fast cache of it.

const TOKEN_KEY = "encodr.token";
const USER_KEY = "encodr.user";

let token: string | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

/** Read localStorage into memory. Called once on the client at startup. */
export function hydrate() {
  if (isBrowser()) token = window.localStorage.getItem(TOKEN_KEY);
}

export function getToken() {
  return token;
}

export function setSession(nextToken: string, user: unknown) {
  token = nextToken;
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, nextToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession() {
  token = null;
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
