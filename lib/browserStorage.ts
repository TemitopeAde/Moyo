type StorageKind = 'local' | 'session';

function getBrowserStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getStorageItem(kind: StorageKind, key: string) {
  try {
    return getBrowserStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function setStorageItem(kind: StorageKind, key: string, value: string) {
  try {
    getBrowserStorage(kind)?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(kind: StorageKind, key: string) {
  try {
    getBrowserStorage(kind)?.removeItem(key);
  } catch {
    // Some in-app browsers block storage access entirely.
  }
}
