// Instant Cache Store with sessionStorage + In-Memory Fallback for 0ms transitions
const memoryStore = new Map();

export const getCachedData = (key) => {
  if (memoryStore.has(key)) {
    return memoryStore.get(key);
  }
  try {
    const serialized = sessionStorage.getItem(`app_cache_${key}`);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      memoryStore.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    // sessionStorage might be restricted or full
  }
  return null;
};

export const setCachedData = (key, data) => {
  memoryStore.set(key, data);
  try {
    sessionStorage.setItem(`app_cache_${key}`, JSON.stringify(data));
  } catch (e) {
    // Silently ignore if quota exceeded for large images
  }
};

export const clearCache = (prefix = '') => {
  if (!prefix) {
    memoryStore.clear();
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('app_cache_')) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  } else {
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
      }
    }
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(`app_cache_${prefix}`)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }
};
