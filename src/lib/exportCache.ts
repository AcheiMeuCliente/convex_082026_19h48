import { ExportCache } from "./types";
import { createHash } from "crypto";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, ExportCache>();

export function generateCacheKey(data: any[]): string {
  const dataString = JSON.stringify(data);
  return createHash('md5').update(dataString).digest('hex');
}

export function getCachedData(key: string): any[] | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCachedData(key: string, data: any[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    hash: generateCacheKey(data)
  });
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size;
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
} 