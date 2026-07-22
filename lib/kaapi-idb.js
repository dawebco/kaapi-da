// IndexedDB helpers for `kaapi-scroll` store.

import { KAAPI_CACHE } from './kaapi-assets';

let _dbPromise = null;

const openDb = () => {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = window.indexedDB.open(KAAPI_CACHE.db, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KAAPI_CACHE.store)) {
        db.createObjectStore(KAAPI_CACHE.store); // keyed manually
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
};

export const idbPut = async (storeName, key, value) => {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

export const idbGet = async (storeName, key) => {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
};

export const idbClearStore = async (storeName) => {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

// Frame key format: `${cacheVersion}::${clipId}::${index}`
export const frameKey = (clipId, index) =>
  `${KAAPI_CACHE.version}::${clipId}::${index}`;

export const getCachedFrame = async (clipId, index) => {
  try {
    return await idbGet(KAAPI_CACHE.store, frameKey(clipId, index));
  } catch { return null; }
};

export const putCachedFrame = async (clipId, index, blob) => {
  await idbPut(KAAPI_CACHE.store, frameKey(clipId, index), blob);
};

export const getMeta = async (key) => {
  try { return await idbGet('meta', key); } catch { return null; }
};
export const setMeta = async (key, value) => idbPut('meta', key, value);

// Cache invalidation: if stored cacheVersion !== current, wipe frames.
export const ensureCacheVersion = async () => {
  const stored = await getMeta('cacheVersion');
  if (stored !== KAAPI_CACHE.version) {
    await idbClearStore(KAAPI_CACHE.store);
    await setMeta('cacheVersion', KAAPI_CACHE.version);
    return { fresh: true };
  }
  return { fresh: false };
};
