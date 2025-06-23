interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService {
  private static cache = new Map<string, CacheItem<unknown>>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes default

  static set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms, Total items: ${this.cache.size})`);
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`💾 Cache MISS: ${key}`);
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      console.log(`💾 Cache EXPIRED: ${key}`);
      return null;
    }

    console.log(`💾 Cache HIT: ${key}`);
    return item.data as T;
  }

  static has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static getSize(): number {
    return this.cache.size;
  }

  // Utility method to generate cache keys
  static generateKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  // Method to get cache statistics
  static getStats(): Record<string, unknown> {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    const expiredKeys: string[] = [];

    // First pass: count items and collect expired keys
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
        expiredKeys.push(key);
      } else {
        validItems++;
      }
    }

    // Second pass: remove expired items
    expiredKeys.forEach(key => this.cache.delete(key));

    const totalItems = validItems + expiredItems;

    return {
      total: totalItems,
      valid: validItems,
      expired: expiredItems,
      currentSize: this.cache.size,
      estimatedSize: validItems * 1024, // Estimate 1KB per item
    };
  }
} 