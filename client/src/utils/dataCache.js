// Instant In-Memory Cache Store for 0ms Section Transitions
const cacheStore = new Map();

export const getCachedData = (key) => {
  return cacheStore.get(key) || null;
};

export const setCachedData = (key, data) => {
  cacheStore.set(key, data);
};

export const clearCache = (prefix = '') => {
  if (!prefix) {
    cacheStore.clear();
  } else {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefix)) {
        cacheStore.delete(key);
      }
    }
  }
};
