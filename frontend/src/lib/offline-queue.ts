const QUEUE_KEY = "gfm_expense_queue";

export interface QueuedExpense {
  idempotency_key: string;
  status: "pending" | "failed";
  retry_count: number;
  last_attempt?: string;
  next_retry?: string;
  error?: string;
  queued_at: string;
  // API payload
  budget_item: string;
  amount: number;
  date: string;
  notes: string;
  quantity?: number;
  // Display metadata captured at queue time
  category_name?: string;
  budget_name?: string;
}

export function getQueue(): QueuedExpense[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveQueue(queue: QueuedExpense[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(
  item: Omit<QueuedExpense, "idempotency_key" | "status" | "retry_count" | "queued_at">
): QueuedExpense {
  const entry: QueuedExpense = {
    ...item,
    idempotency_key: crypto.randomUUID(),
    status: "pending",
    retry_count: 0,
    queued_at: new Date().toISOString(),
  };
  const queue = getQueue();
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

export function removeFromQueue(idempotency_key: string): void {
  saveQueue(getQueue().filter((e) => e.idempotency_key !== idempotency_key));
}

export function updateQueueEntry(
  idempotency_key: string,
  updates: Partial<QueuedExpense>
): void {
  saveQueue(
    getQueue().map((e) =>
      e.idempotency_key === idempotency_key ? { ...e, ...updates } : e
    )
  );
}

export function clearFailed(): void {
  saveQueue(getQueue().filter((e) => e.status !== "failed"));
}
