const PREFIX = "gfm_qc:";

export interface CacheEntry<T> {
  data: T;
  ts: string; // ISO timestamp
}

export function getCacheEntry<T>(queryKey: unknown[]): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + JSON.stringify(queryKey));
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

export function setCacheEntry<T>(queryKey: unknown[], data: T): void {
  try {
    localStorage.setItem(
      PREFIX + JSON.stringify(queryKey),
      JSON.stringify({ data, ts: new Date().toISOString() })
    );
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
