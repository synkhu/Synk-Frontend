"use client";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default
  public readonly USER_CACHE_TTL = 60 * 60 * 1000; // 1 hour for user data
  private readonly CACHE_PREFIX = "synk_cache_";

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private getStorageKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    // Check in-memory cache first
    let entry = this.cache.get(key);

    // If not in memory, try to load from localStorage
    if (!entry && this.isBrowser()) {
      try {
        const stored = localStorage.getItem(this.getStorageKey(key));
        if (stored) {
          entry = JSON.parse(stored);
          // Restore to in-memory cache
          this.cache.set(key, entry);
        }
      } catch (error) {
        console.error("Failed to load cache from localStorage:", error);
      }
    }

    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      // Cache expired, remove it
      this.cache.delete(key);
      if (this.isBrowser()) {
        localStorage.removeItem(this.getStorageKey(key));
      }
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache data with optional TTL (time to live in milliseconds)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    // Store in memory
    this.cache.set(key, entry);

    // Persist to localStorage
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
      } catch (error) {
        console.error("Failed to persist cache to localStorage:", error);
      }
    }
  }

  /**
   * Check if cache key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a specific cache entry
   */
  remove(key: string): void {
    this.cache.delete(key);
    if (this.isBrowser()) {
      localStorage.removeItem(this.getStorageKey(key));
    }
  }

  /**
   * Remove all cache entries matching a pattern
   */
  removePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        if (this.isBrowser()) {
          localStorage.removeItem(this.getStorageKey(key));
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    if (this.isBrowser()) {
      // Clear all synk cache entries from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = new CacheService();
