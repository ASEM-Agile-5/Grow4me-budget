import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Download, Plus, MoreHorizontal, WifiOff, X, Check, Trash2 } from "lucide-react";
import { useBudgetDetails, useBudgets, useAddBudgetItem, useBudgetCategories, useDeleteBudgetItem } from "@/hooks/use-budgets";
import { useOfflineFallback } from "@/hooks/use-offline-fallback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Stat, PaceCard, HBar, fmtK, fmt, pct, catColor } from "@/components/gfm/primitives";
import { Wallet, Receipt, Coins } from "lucide-react";
import { toast } from "sonner";

function exportItemsCSV(items: any[], budgetName: string) {
  const header = ["Category", "Description", "Planned", "Actual", "Variance"];
  const rows = items.map((i: any) => {
    const ip = Number(i.planned_amount ?? i.planned ?? 0);
    const ia = Number(i.spent ?? i.actual ?? 0);
    return [
      i.category_name ?? "",
      (i.description ?? "").replace(/,/g, ";"),
      ip.toFixed(2),
      ia.toFixed(2),
      (ia - ip).toFixed(2),
    ];
  });
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${budgetName.replace(/\s+/g, "_")}_items_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AddLineItemModal({ budgetId, onClose }: { budgetId: string; onClose: () => void }) {
  const { data: categories = [] } = useBudgetCategories();
  const addItem = useAddBudgetItem();
  const [categoryId, setCategoryId] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isInventory, setIsInventory] = useState(false);
  const [units, setUnits] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) { toast.error("You need an internet connection to add line items."); return; }
    if (!categoryId || !plannedAmount) { toast.error("Category and planned amount are required."); return; }
    setSubmitting(true);
    try {
      await addItem.mutateAsync({
        budget: budgetId,
        category: categoryId,
        planned_amount: Number(plannedAmount),
        ...(isInventory ? { inventory: true, units: units || "units", quantity: Number(quantity) || 0 } : {}),
      });
      toast.success("Line item added.");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add line item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="gfm-card" style={{ width: "min(480px, 95vw)", padding: 0 }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--gfm-ink-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Add Line Item</div>
            <div className="gfm-muted" style={{ fontSize: 13, marginTop: 3 }}>Add a category spend target to this budget.</div>
          </div>
          <button className="gfm-icon-btn" style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--gfm-ink-200)" }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Category <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <select className="gfm-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">Select a category…</option>
              {(categories as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Planned amount (₵) <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <input className="gfm-input" type="number" min="0" step="0.01" placeholder="0.00" value={plannedAmount} onChange={e => setPlannedAmount(e.target.value)} required />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Description</span>
            <input className="gfm-input" placeholder="Optional notes…" value={description} onChange={e => setDescription(e.target.value)} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={isInventory} onChange={e => setIsInventory(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--gfm-green-600)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gfm-ink-700)" }}>Track as inventory item</span>
          </label>

          {isInventory && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="gfm-label">Units</span>
                <input className="gfm-input" placeholder="e.g. kg, bags…" value={units} onChange={e => setUnits(e.target.value)} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="gfm-label">Initial quantity</span>
                <input className="gfm-input" type="number" min="0" step="1" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </label>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, borderTop: "1px solid var(--gfm-ink-100)", marginTop: 4 }}>
            <button type="button" className="gfm-btn gfm-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="gfm-btn gfm-btn-primary" disabled={submitting}>
              {submitting
                ? <><div className="gfm-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                : <><Check size={14} />Add item</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemMenu({ itemId, isOnline, onDeleted }: { itemId: string; isOnline: boolean; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const deleteItem = useDeleteBudgetItem();

  const handleDelete = async () => {
    if (!isOnline) { toast.error("You need an internet connection to delete items."); setOpen(false); return; }
    if (!confirm("Delete this line item? This cannot be undone.")) return;
    try {
      await deleteItem.mutateAsync(itemId);
      toast.success("Line item deleted.");
      onDeleted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete item.");
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="gfm-icon-btn"
        style={{ width: 28, height: 28, border: 0, background: "transparent" }}
        onClick={() => setOpen(o => !o)}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 50, background: "#fff", border: "1px solid var(--gfm-ink-100)", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 140, padding: 6 }}>
            <button
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", background: "none", border: 0, borderRadius: 7, cursor: "pointer", fontSize: 13, color: "var(--gfm-danger)", fontWeight: 600 }}
              onClick={handleDelete}
            >
              <Trash2 size={13} />Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BudgetDetail() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { data: budgetsRaw } = useBudgets();
  const { data: detailsRaw, isLoading, refetch } = useBudgetDetails(budgetId ?? null);
  const [showAddItem, setShowAddItem] = useState(false);

  const { data: budgets, usingCache, lastSynced } = useOfflineFallback(["budgets"], budgetsRaw, []);
  const { data: details } = useOfflineFallback(["budget-details", budgetId], detailsRaw, null);

  const budget = (budgets as any[]).find((b: any) => b.id?.toString() === budgetId?.toString());
  const items: any[] = (details as any)?.items ?? (details as any)?.budget_items ?? [];

  const planned  = Number(budget?.planned ?? 0);
  const actual   = Number(budget?.spent   ?? 0);
  const left     = Number(budget?.left    ?? planned - actual);
  const utilPct  = pct(actual, planned);
  const expected = Math.round(planned * 0.67);

  if (isLoading && !items.length && !budget) return (
    <div className="gfm-page" style={{ placeItems: "center" }}>
      <div className="gfm-spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="gfm-page">
      {showAddItem && budgetId && (
        <AddLineItemModal budgetId={budgetId} onClose={() => setShowAddItem(false)} />
      )}

      {usingCache && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "#92400e" }}>
          <WifiOff size={13} />Showing cached data · Last synced: {lastSynced}
        </div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--gfm-ink-500)", marginBottom: 10 }}>
          <button style={{ background: "none", border: 0, color: "inherit", padding: 0, cursor: "pointer", fontWeight: 600 }}
            onClick={() => navigate("/budgets")}>Budgets</button>
          <ChevronRight size={11} />
          <span>{budget?.project}</span>
        </div>
        <div className="gfm-page-head">
          <div>
            <h1 className="gfm-h1">{budget?.name ?? "Budget Detail"}</h1>
            <div className="gfm-h1-sub">{budget?.description ?? `${budget?.project} · ${budget?.year}`}</div>
          </div>
          <div className="gfm-page-actions">
            <button className="gfm-btn gfm-btn-ghost" onClick={() => exportItemsCSV(items, budget?.name ?? "budget")}>
              <Download size={13} />Export CSV
            </button>
            <button
              className="gfm-btn gfm-btn-primary"
              onClick={() => isOnline ? setShowAddItem(true) : toast.error("You need an internet connection to add line items.")}
            >
              <Plus size={13} />Add line item
            </button>
          </div>
        </div>
      </div>

      <div className="gfm-grid" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr" }}>
        <PaceCard title="Budget progress" actual={actual} planned={planned} expected={expected}
          label={`${utilPct}% of plan used`} />
        <Stat icon={<Wallet size={16} />}  tone="green" label="Planned" value={fmtK(planned)} sub={`${items.length} line items`} />
        <Stat icon={<Receipt size={16} />} tone="amber" label="Actual"  value={fmtK(actual)}  sub={`${utilPct}% utilised`} />
        <Stat icon={<Coins size={16} />}   tone="ink"   label="Balance" value={fmtK(Math.abs(left))} sub={left < 0 ? "over budget" : "remaining"} />
      </div>

      <div className="gfm-card">
        <div className="gfm-card-head">
          <div><h3>Line items</h3><div className="sub">Plan vs. actual across every category</div></div>
        </div>
        <div style={{ padding: "0 10px 8px" }}>
          {items.length > 0 ? (
            <table className="gfm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Planned</th>
                  <th style={{ textAlign: "right" }}>Actual</th>
                  <th style={{ width: 200 }}>Pace</th>
                  <th>Status</th>
                  <th style={{ paddingRight: 20, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const ip = Number(item.planned_amount ?? item.planned ?? 0);
                  const ia = Number(item.spent ?? item.actual ?? 0);
                  const ipct = pct(ia, ip);
                  const over = ia > ip;
                  return (
                    <tr key={item.id}>
                      <td style={{ paddingLeft: 20 }}>
                        <span className="gfm-cat">
                          <span className="sw" style={{ background: catColor(item.category_name) }} />
                          {item.category_name}
                        </span>
                      </td>
                      <td className="gfm-muted" style={{ maxWidth: 280 }}>{item.description ?? "—"}</td>
                      <td className="gfm-num" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(ip)}</td>
                      <td className="gfm-num" style={{ textAlign: "right", fontWeight: 800, color: over ? "var(--gfm-danger)" : "var(--gfm-ink-900)" }}>
                        {fmt(ia)}
                      </td>
                      <td><HBar planned={ip} actual={ia} /></td>
                      <td>
                        <span className={`gfm-badge ${over ? "over" : ipct > 85 ? "warn" : "ok"}`}>
                          <span className="dot" />{over ? "Exceeded" : ipct > 85 ? "Near limit" : "On track"}
                        </span>
                      </td>
                      <td style={{ paddingRight: 20 }}>
                        <ItemMenu itemId={item.id?.toString()} isOnline={isOnline} onDeleted={() => refetch()} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div className="gfm-empty">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>No line items yet</div>
                <div style={{ fontSize: 12, marginBottom: 14 }}>Add items to track planned vs actual spend.</div>
                {isOnline && (
                  <button className="gfm-btn gfm-btn-primary" style={{ margin: "0 auto" }} onClick={() => setShowAddItem(true)}>
                    <Plus size={13} />Add first item
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
