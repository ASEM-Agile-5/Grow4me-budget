import { useState, useEffect } from "react";
import { Download, Plus, Filter, CalendarDays, Search, X, Check } from "lucide-react";
import { useExpenses, useBudgets, useBudgetDetails, useCreateExpense } from "@/hooks/use-budgets";
import { Stat, fmtK, fmtC, catColor } from "@/components/gfm/primitives";
import { Receipt, Wallet, Activity } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

function exportCSV(expenses: any[]) {
  const header = ["Date", "Category", "Budget", "Notes", "Amount"];
  const rows = expenses.map((e: any) => [
    new Date(e.date).toLocaleDateString("en-GB"),
    e.category_name ?? "",
    e.budget_name ?? "",
    (e.notes ?? "").replace(/,/g, ";"),
    Number(e.amount ?? 0).toFixed(2),
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LogExpenseModal({ onClose }: { onClose: () => void }) {
  const { data: budgets = [] } = useBudgets();
  const [budgetId, setBudgetId] = useState("");
  const [budgetItemId, setBudgetItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: details } = useBudgetDetails(budgetId || null);
  const items: any[] = details?.items ?? details?.budget_items ?? [];

  const createExpense = useCreateExpense();

  const selectedItem = items.find((i: any) => i.id?.toString() === budgetItemId);
  const isInventory = selectedItem?.inventory === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetItemId || !amount || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await createExpense.mutateAsync({
        budget_item: budgetItemId,
        amount: Number(amount),
        date,
        notes,
        ...(isInventory && quantity ? { quantity: Number(quantity) } : {}),
      });
      toast.success("Expense logged successfully.");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to log expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="gfm-card" style={{ width: "min(520px, 95vw)", padding: 0 }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--gfm-ink-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Log Expense</div>
            <div className="gfm-muted" style={{ fontSize: 13, marginTop: 3 }}>Record a spend against a budget line item.</div>
          </div>
          <button className="gfm-icon-btn" style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--gfm-ink-200)" }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Budget */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Budget <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <select
              className="gfm-select"
              value={budgetId}
              onChange={e => { setBudgetId(e.target.value); setBudgetItemId(""); }}
              required
            >
              <option value="">Select a budget…</option>
              {budgets.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>

          {/* Budget item */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Line item <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <select
              className="gfm-select"
              value={budgetItemId}
              onChange={e => setBudgetItemId(e.target.value)}
              required
              disabled={!budgetId || items.length === 0}
            >
              <option value="">{budgetId ? (items.length === 0 ? "No items in this budget" : "Select line item…") : "Select a budget first"}</option>
              {items.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.category_name}{item.description ? ` — ${item.description}` : ""}
                </option>
              ))}
            </select>
          </label>

          {/* Amount + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Amount (₵) <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input
                className="gfm-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Date <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input
                className="gfm-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </label>
          </div>

          {/* Quantity — only for inventory items */}
          {isInventory && (
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Quantity used</span>
              <input
                className="gfm-input"
                type="number"
                min="0"
                placeholder="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </label>
          )}

          {/* Notes */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Notes</span>
            <input
              className="gfm-input"
              placeholder="What was this expense for?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </label>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, borderTop: "1px solid var(--gfm-ink-100)", marginTop: 4 }}>
            <button type="button" className="gfm-btn gfm-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="gfm-btn gfm-btn-primary" disabled={submitting}>
              {submitting
                ? <><div className="gfm-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                : <><Check size={14} />Log expense</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("log") === "1") {
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const list = [...expenses].reverse();
  const filtered = search
    ? list.filter((e: any) =>
        (e.notes ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (e.category_name ?? "").toLowerCase().includes(search.toLowerCase()))
    : list;

  const totalSum = list.reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);

  const thisWeek = list.filter((e: any) => {
    const d = new Date(e.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);

  const catTot: Record<string, number> = {};
  list.forEach((e: any) => { catTot[e.category_name] = (catTot[e.category_name] || 0) + Number(e.amount ?? 0); });
  const topCat = Object.entries(catTot).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="gfm-page">
      {showModal && <LogExpenseModal onClose={() => setShowModal(false)} />}

      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Expenses</h1>
          <div className="gfm-h1-sub">Every coin spent, tied to a budget.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-ghost" onClick={() => exportCSV([...expenses].reverse())}><Download size={13} />Export CSV</button>
          <button className="gfm-btn gfm-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={13} />Log expense
          </button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Receipt size={16} />}  tone="green" label="Total expenses" value={fmtK(totalSum)} sub={`${list.length} entries`} />
        <Stat icon={<Wallet size={16} />}   tone="amber" label="This week"      value={fmtK(thisWeek)} sub="last 7 days" />
        <Stat icon={<Activity size={16} />} tone="ink"   label="Avg / day"      value={fmtK(Math.round(totalSum / 30))} sub="Last 30 days" />
        <Stat icon={<Filter size={16} />}   tone="blue"  label="Top category"
          value={topCat ? topCat[0] : "—"} sub={topCat ? fmtC(topCat[1]) + " spent" : "No data"} />
      </div>

      <div className="gfm-card">
        <div className="gfm-card-head" style={{ paddingBottom: 14, borderBottom: "1px solid var(--gfm-ink-100)" }}>
          <div className="gfm-search" style={{ maxWidth: 320, flex: "0 0 320px", height: 36 }}>
            <Search size={13} />
            <input placeholder="Search notes, category…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="gfm-btn gfm-btn-ghost gfm-btn-sm"><Filter size={11} />Category</button>
            <button className="gfm-btn gfm-btn-ghost gfm-btn-sm"><CalendarDays size={11} />Date range</button>
          </div>
        </div>
        <div style={{ padding: "0 10px 8px" }}>
          {isLoading ? (
            <div style={{ padding: 32, display: "grid", placeItems: "center" }}><div className="gfm-spinner" /></div>
          ) : filtered.length > 0 ? (
            <table className="gfm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Date</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Notes</th>
                  <th>Method</th>
                  <th style={{ textAlign: "right", paddingRight: 20 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr key={e.id}>
                    <td className="gfm-num gfm-muted" style={{ paddingLeft: 20 }}>
                      {new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <span className="gfm-cat">
                        <span className="sw" style={{ background: catColor(e.category_name) }} />
                        {e.category_name}
                      </span>
                    </td>
                    <td><span className="gfm-badge">{e.budget_name}</span></td>
                    <td className="gfm-muted" style={{ maxWidth: 260 }}>{e.notes}</td>
                    <td><span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gfm-ink-600)" }}>{e.method ?? "—"}</span></td>
                    <td className="gfm-num" style={{ textAlign: "right", paddingRight: 20, fontWeight: 800 }}>
                      {fmtC(Number(e.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>
              {search ? "No expenses match your search." : "No expenses logged yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
