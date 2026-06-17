// Cache utility for map API calls
function createMapCache() {
    const cache = new Map();
    const maxAge = 10 * 60 * 1000; // 10 minutes default
    const maxSize = 500; // Maximum number of cached items

    // Generate cache key from URL and parameters
    function generateKey(url, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${url}?${sortedParams}`;
    }

    // Check if cache entry is still valid
    function isExpired(entry) {
        return Date.now() - entry.timestamp > maxAge;
    }

    // Get cached data
    function get(key) {
        const entry = cache.get(key);
        if (!entry) return null;
        
        if (isExpired(entry)) {
            cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    // Set cache data
    function set(key, data) {
        // Remove oldest entries if cache is full
        if (cache.size >= maxSize) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }
        
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Clear expired entries
    function cleanup() {
        for (const [key, entry] of cache.entries()) {
            if (isExpired(entry)) {
                cache.delete(key);
            }
        }
    }

    // Clear all cache
    function clear() {
        cache.clear();
    }

    // Get cache statistics
    function getStats() {
        return {
            size: cache.size,
            maxSize: maxSize,
            maxAge: maxAge
        };
    }

    return {
        generateKey,
        get,
        set,
        cleanup,
        clear,
        getStats
    };
}

// Create global cache instance
const mapCache = createMapCache();

// Cached fetch function
async function cachedFetch(url, options = {}) {
    const cacheKey = mapCache.generateKey(url, options.params || {});
    
    // Try to get from cache first
    const cachedData = mapCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const urlToFetch = new URL(url);
    urlToFetch.search = new URLSearchParams(options.params).toString();
    
    try {
        const response = await fetch(urlToFetch.toString());
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the successful response
        mapCache.set(cacheKey, data);
        
        return data;
    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}

// Cache management functions
function clearMapCache() {
    mapCache.clear();
}

function getCacheStats() {
    return mapCache.getStats();
}

export {mapCache, cachedFetch, clearMapCache, getCacheStats};