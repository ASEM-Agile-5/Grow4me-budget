import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCacheEntry, setCacheEntry, timeAgo } from "./query-cache";

describe("query-cache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-23T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("setCacheEntry and getCacheEntry round-trip", () => {
    const key = ["budgets", "list"];
    setCacheEntry(key, { items: [1, 2] });
    const entry = getCacheEntry<{ items: number[] }>(key);
    expect(entry).not.toBeNull();
    expect(entry!.data).toEqual({ items: [1, 2] });
    expect(entry!.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("getCacheEntry returns null for missing key", () => {
    expect(getCacheEntry(["nope"])).toBeNull();
  });

  it("getCacheEntry returns null on corrupt JSON", () => {
    localStorage.setItem('gfm_qc:["x"]', "not-json");
    expect(getCacheEntry(["x"])).toBeNull();
  });

  it("timeAgo formats recent times", () => {
    const twoMinAgo = new Date("2026-04-23T11:58:00.000Z").toISOString();
    expect(timeAgo(twoMinAgo)).toBe("2m ago");
    const thirtyMinAgo = new Date("2026-04-23T11:30:00.000Z").toISOString();
    expect(timeAgo(thirtyMinAgo)).toBe("30m ago");
  });
});
