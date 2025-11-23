/**
 * Cache manager for storing and retrieving valuation results
 * Reduces API calls and token usage by caching results for 24 hours
 */

interface CachedResult {
  data: any;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_PREFIX = 'valuation_cache_';

/**
 * Generate cache key from car details
 */
function generateCacheKey(carDetails: {
  brand: string;
  model: string;
  year: string;
  kmDriven: string;
  fuel: string;
}): string {
  // Normalize km driven to ranges for better cache hits
  const km = parseInt(carDetails.kmDriven);
  let kmRange = '';
  if (km < 20000) kmRange = '0-20k';
  else if (km < 40000) kmRange = '20-40k';
  else if (km < 60000) kmRange = '40-60k';
  else if (km < 80000) kmRange = '60-80k';
  else if (km < 100000) kmRange = '80-100k';
  else kmRange = '100k+';
  
  const key = `${carDetails.brand}_${carDetails.model}_${carDetails.year}_${kmRange}_${carDetails.fuel}`;
  return CACHE_PREFIX + key.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Store result in cache
 */
export function cacheResult(carDetails: any, result: any): void {
  try {
    const cacheKey = generateCacheKey(carDetails);
    const cached: CachedResult = {
      data: result,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache result:', error);
  }
}

/**
 * Retrieve result from cache if available and not expired
 */
export function getCachedResult(carDetails: any): any | null {
  try {
    const cacheKey = generateCacheKey(carDetails);
    const cachedStr = sessionStorage.getItem(cacheKey);
    
    if (!cachedStr) return null;
    
    const cached: CachedResult = JSON.parse(cachedStr);
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.warn('Failed to retrieve cached result:', error);
    return null;
  }
}

/**
 * Clear all cached results
 */
export function clearCache(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; oldestAge: number } {
  try {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let oldestAge = 0;
    cacheKeys.forEach(key => {
      try {
        const cached: CachedResult = JSON.parse(sessionStorage.getItem(key) || '{}');
        const age = Date.now() - cached.timestamp;
        if (age > oldestAge) oldestAge = age;
      } catch (e) {
        // Ignore parse errors
      }
    });
    
    return {
      count: cacheKeys.length,
      oldestAge: Math.floor(oldestAge / 1000 / 60) // in minutes
    };
  } catch (error) {
    return { count: 0, oldestAge: 0 };
  }
}
