import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearFailed,
  enqueue,
  getQueue,
  removeFromQueue,
  saveQueue,
  updateQueueEntry,
} from "./offline-queue";

const basePayload = {
  budget_item: "item-1",
  amount: 25.5,
  date: "2026-04-23",
  notes: "test",
};

describe("offline-queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("uuid-1")
        .mockReturnValueOnce("uuid-2"),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("enqueue appends with idempotency_key and pending status", () => {
    const e = enqueue(basePayload);
    expect(e.idempotency_key).toBe("uuid-1");
    expect(e.status).toBe("pending");
    expect(e.retry_count).toBe(0);
    expect(getQueue()).toHaveLength(1);
  });

  it("removeFromQueue filters by idempotency_key", () => {
    enqueue(basePayload);
    removeFromQueue("uuid-1");
    expect(getQueue()).toHaveLength(0);
  });

  it("updateQueueEntry merges fields", () => {
    enqueue(basePayload);
    updateQueueEntry("uuid-1", { status: "failed", retry_count: 2 });
    const q = getQueue();
    expect(q[0].status).toBe("failed");
    expect(q[0].retry_count).toBe(2);
  });

  it("clearFailed removes failed entries only", () => {
    enqueue(basePayload);
    updateQueueEntry("uuid-1", { status: "failed" });
    enqueue({ ...basePayload, notes: "second" });
    clearFailed();
    expect(getQueue()).toHaveLength(1);
    expect(getQueue()[0].status).toBe("pending");
  });

  it("getQueue returns empty array on corrupt storage", () => {
    localStorage.setItem("gfm_expense_queue", "{");
    expect(getQueue()).toEqual([]);
  });

  it("saveQueue persists full list", () => {
    saveQueue([]);
    expect(getQueue()).toEqual([]);
  });
});
