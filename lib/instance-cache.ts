// In-memory cache for instance status
// Reduces N8N API calls and CPU usage

type CachedInstance = {
    data: any;
    timestamp: number;
};

const cache = new Map<string, CachedInstance>();
const CACHE_TTL = 45000; // 45 seconds cache (increased for getAllWorkflows)

export function getCachedInstanceStatus(instanceId: string) {
    const cached = cache.get(instanceId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[CACHE HIT] Instance ${instanceId} - ${Math.round((Date.now() - cached.timestamp) / 1000)}s old`);
        return cached.data;
    }
    console.log(`[CACHE MISS] Instance ${instanceId}`);
    return null;
}

export function setCachedInstanceStatus(instanceId: string, data: any) {
    cache.set(instanceId, {
        data,
        timestamp: Date.now()
    });
    console.log(`[CACHE SET] Instance ${instanceId}`);
}

export function clearCache() {
    cache.clear();
    console.log(`[CACHE CLEARED] All instance status cleared`);
}

// Auto cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
            cache.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`[CACHE CLEANUP] Removed ${cleaned} stale entries`);
    }
}, 300000); // 5 minutes
