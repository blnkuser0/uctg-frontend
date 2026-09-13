/**
 * In-memory access token holder. Never persisted to localStorage (XSS hardening) —
 * mirrored to IndexedDB only so the service worker can read it for background actions.
 */

const DB_NAME = "ugnexa-catalyst-auth";
const STORE_NAME = "tokens";
const TOKEN_KEY = "accessToken";

let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
  void mirrorToIndexedDb(token);
}

export function getAccessToken(): string | null {
  return inMemoryToken;
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function mirrorToIndexedDb(token: string | null): Promise<void> {
  const db = await openDb();
  if (!db) return;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  if (token) {
    store.put(token, TOKEN_KEY);
  } else {
    store.delete(TOKEN_KEY);
  }
}
