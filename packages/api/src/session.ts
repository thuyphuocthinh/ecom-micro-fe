const ACCESS_TOKEN_KEY = "ecom.accessToken";
const REFRESH_TOKEN_KEY = "ecom.refreshToken";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** The stored value, null when nothing is stored, undefined when storage cannot be used at all. */
function readStorage(key: string): string | null | undefined {
  try {
    return localStorage.getItem(key);
  } catch {
    return undefined; // blocked storage (private window, site data off)
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // The token then lives only in memory: the login is lost when the page reloads
  }
}

/**
 * Where the login lives: both tokens are kept in localStorage, so a reload or a second tab stays
 * logged in and every tab sees the tokens another tab renewed. Memory is the fallback when storage
 * is blocked.
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

  // Storage is the truth while it works (another tab may have renewed or cleared the tokens)
  const read = (key: string, inMemory: string | null) => {
    const stored = readStorage(key);
    return stored === undefined ? inMemory : stored;
  };

  return {
    getAccessToken: () => read(ACCESS_TOKEN_KEY, accessToken),
    getRefreshToken: () => read(REFRESH_TOKEN_KEY, refreshToken),
    set(tokens) {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
      writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
    },
    clear() {
      accessToken = null;
      refreshToken = null;
      writeStorage(ACCESS_TOKEN_KEY, null);
      writeStorage(REFRESH_TOKEN_KEY, null);
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
