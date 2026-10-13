const REFRESH_TOKEN_KEY = "ecom.refreshToken";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null; // blocked storage (private window, site data off): behave as if empty
  }
}

function writeStorage(value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(REFRESH_TOKEN_KEY);
    else localStorage.setItem(REFRESH_TOKEN_KEY, value);
  } catch {
    // The refresh token then lives only in memory: the login is lost when the page reloads
  }
}

/**
 * Where the login lives. The access token stays in memory only; the refresh token is also kept in
 * localStorage so a reload or a second tab stays logged in.
 */
export interface Session {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  set(tokens: TokenPair): void;
  clear(): void;
  /** The shell registers what to do when the login can no longer be renewed (go to the login page). */
  onExpired(listener: () => void): () => void;
  /** Called by the client only. */
  notifyExpired(): void;
}

export function createSession(): Session {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  const listeners = new Set<() => void>();

  return {
    getAccessToken: () => accessToken,
    getRefreshToken: () => refreshToken ?? readStorage(),
    set(tokens) {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      writeStorage(tokens.refreshToken);
    },
    clear() {
      accessToken = null;
      refreshToken = null;
      writeStorage(null);
    },
    onExpired(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notifyExpired() {
      for (const listener of [...listeners]) listener();
    },
  };
}

/** The one session every app shares (this module is a Module Federation singleton). */
export const session: Session = createSession();
