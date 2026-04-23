import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as Q from "@/lib/offline-queue";
import { getCookie } from "@/services/services";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://grow4me-backend-213305484430.us-central1.run.app/";
const MAX_RETRIES = 3;
const POLL_INTERVAL_MS = 5_000;

async function submitOne(entry: Q.QueuedExpense): Promise<void> {
  const token = getCookie("access_token");
  const res = await fetch(`${API_BASE}budget/expenses/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Idempotency-Key": entry.idempotency_key,
    },
    body: JSON.stringify({
      budget_item: entry.budget_item,
      amount: entry.amount,
      date: entry.date,
      notes: entry.notes,
      ...(entry.quantity != null ? { quantity: entry.quantity } : {}),
    }),
  });
  // 409 = server already processed this idempotency key — treat as success
  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.detail ?? `HTTP ${res.status}`);
  }
}

export function useOfflineExpenseQueue() {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<Q.QueuedExpense[]>(Q.getQueue);
  const syncingRef = useRef(false);

  const refresh = useCallback(() => setQueue(Q.getQueue()), []);

  const syncQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    const pending = Q.getQueue().filter((e) => e.status === "pending");
    if (pending.length === 0) return;

    syncingRef.current = true;
    let synced = 0;
    let failed = 0;

    for (const entry of pending) {
      Q.updateQueueEntry(entry.idempotency_key, {
        last_attempt: new Date().toISOString(),
      });
      try {
        await submitOne(entry);
        Q.removeFromQueue(entry.idempotency_key);
        synced++;
      } catch (err: any) {
        const retries = (entry.retry_count ?? 0) + 1;
        if (retries >= MAX_RETRIES) {
          Q.updateQueueEntry(entry.idempotency_key, {
            status: "failed",
            retry_count: retries,
            error: err.message,
          });
          failed++;
        } else {
          // Exponential backoff: 2s, 4s, 8s
          const delayMs = Math.pow(2, retries) * 1000;
          Q.updateQueueEntry(entry.idempotency_key, {
            retry_count: retries,
            error: err.message,
            next_retry: new Date(Date.now() + delayMs).toISOString(),
          });
        }
      }
    }

    refresh();
    syncingRef.current = false;

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success(
        `${synced} expense${synced > 1 ? "s" : ""} synced successfully.`
      );
    }
    if (failed > 0) {
      toast.error(
        `${failed} expense${failed > 1 ? "s" : ""} failed to sync after ${MAX_RETRIES} attempts. Marked as "Sync failed".`
      );
    }
  }, [refresh, queryClient]);

  // Service Worker message listener (Background Sync)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "GFM_SYNC_REQUEST") syncQueue();
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [syncQueue]);

  // Fallback: online event listener for browsers without Background Sync
  useEffect(() => {
    const handler = () => setTimeout(syncQueue, 1500);
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [syncQueue]);

  // Polling: retry items whose next_retry time has elapsed
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const ready = Q.getQueue().filter(
        (e) =>
          e.status === "pending" &&
          e.next_retry != null &&
          new Date(e.next_retry).getTime() <= now
      );
      if (ready.length > 0 && navigator.onLine) syncQueue();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [syncQueue]);

  const enqueue = useCallback(
    (
      item: Omit<
        Q.QueuedExpense,
        "idempotency_key" | "status" | "retry_count" | "queued_at"
      >
    ) => {
      const entry = Q.enqueue(item);
      refresh();
      // Register Background Sync tag so SW can trigger flush when online
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            if ("sync" in reg) {
              (reg as any).sync.register("sync-expenses").catch(() => {});
            }
          })
          .catch(() => {});
      }
      return entry;
    },
    [refresh]
  );

  const clearFailed = useCallback(() => {
    Q.clearFailed();
    refresh();
  }, [refresh]);

  return { queue, enqueue, syncQueue, clearFailed, refresh };
}
