type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTL_seconds: number = 300) {
    this.defaultTTL = defaultTTL_seconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl_seconds?: number): void {
    const ttl = (ttl_seconds ?? this.defaultTTL / 1000) * 1000;
    this.store.set(key, { data, expiry: Date.now() + ttl });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }

  get size(): number {
    return this.store.size;
  }
}

export const medicineCache = new MemoryCache(300);
