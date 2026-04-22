import { useOnlineStatus } from "./use-online-status";
import { getCacheEntry, timeAgo } from "@/lib/query-cache";

/**
 * For any query that may be undefined while offline, returns cached data
 * from localStorage and metadata about the cache state.
 */
export function useOfflineFallback<T>(
  queryKey: unknown[],
  liveData: T | undefined,
  defaultValue: T
): { data: T; usingCache: boolean; cachedAt: string | null; lastSynced: string | null } {
  const isOnline = useOnlineStatus();
  const entry = getCacheEntry<T>(queryKey);

  const usingCache = liveData === undefined && !isOnline && entry !== null;
  const data = liveData !== undefined ? liveData : usingCache ? entry!.data : defaultValue;

  return {
    data,
    usingCache,
    cachedAt: entry?.ts ?? null,
    lastSynced: entry ? timeAgo(entry.ts) : null,
  };
}
