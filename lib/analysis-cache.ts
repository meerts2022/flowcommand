import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'analysis-cache.json');

export interface AnalysisCache {
    [executionId: string]: {
        instanceId: string;
        executionId: string;
        analysis: string;
        timestamp: string;
        errorMessage?: string;
    };
}

// Ensure cache file exists
function ensureCacheFile() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    if (!fs.existsSync(CACHE_FILE)) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));
    }
}

export function getCachedAnalysis(executionId: string): string | null {
    try {
        ensureCacheFile();
        const cache: AnalysisCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        const cached = cache[executionId];

        if (cached) {
            console.log(`[Cache HIT] Found cached analysis for execution ${executionId}`);
            return cached.analysis;
        }

        console.log(`[Cache MISS] No cached analysis for execution ${executionId}`);
        return null;
    } catch (error) {
        console.error('Error reading analysis cache:', error);
        return null;
    }
}

export function saveCachedAnalysis(
    instanceId: string,
    executionId: string,
    analysis: string,
    errorMessage?: string
): void {
    try {
        ensureCacheFile();
        const cache: AnalysisCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));

        cache[executionId] = {
            instanceId,
            executionId,
            analysis,
            timestamp: new Date().toISOString(),
            errorMessage,
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`[Cache SAVE] Cached analysis for execution ${executionId}`);
    } catch (error) {
        console.error('Error saving to analysis cache:', error);
    }
}

export function clearCache(): void {
    try {
        ensureCacheFile();
        fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));
        console.log('[Cache CLEAR] Cleared all cached analyses');
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

export function getCacheStats(): { totalAnalyses: number; oldestTimestamp: string | null; newestTimestamp: string | null } {
    try {
        ensureCacheFile();
        const cache: AnalysisCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        const entries = Object.values(cache);

        if (entries.length === 0) {
            return { totalAnalyses: 0, oldestTimestamp: null, newestTimestamp: null };
        }

        const timestamps = entries.map(e => e.timestamp).sort();

        return {
            totalAnalyses: entries.length,
            oldestTimestamp: timestamps[0],
            newestTimestamp: timestamps[timestamps.length - 1],
        };
    } catch (error) {
        console.error('Error getting cache stats:', error);
        return { totalAnalyses: 0, oldestTimestamp: null, newestTimestamp: null };
    }
}
