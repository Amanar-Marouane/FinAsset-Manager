import { StatModule, StatIndexEntry } from '@/lib/types';

export type { StatModule };

// Global module cache
const moduleCache = new Map<string, Promise<StatModule>>();

// Add a helper to manage stat module loading with proper caching
const createStatLoader = (id: string, importFunc: () => Promise<StatModule>) => {
    return () => {
        // Use the module from cache if available
        if (!moduleCache.has(id)) {
            const modulePromise = importFunc();
            moduleCache.set(id, modulePromise);
        }
        return moduleCache.get(id)!;
    };
};

export const statsIndex: readonly StatIndexEntry[] = [
    {
        id: 'ChartStats',
        title: 'Chart Stats',
        loader: createStatLoader('ChartStats', () => import('./chart-stats') as Promise<StatModule>),
    },
    {
        id: 'MetricsStats',
        title: 'Metrics Stats',
        loader: createStatLoader('MetricsStats', () => import('./metric-stats') as Promise<StatModule>),
    },
] as const;

export const statsById = Object.fromEntries(
    statsIndex.map(stat => [stat.id, stat])
) as Record<string, StatIndexEntry>;