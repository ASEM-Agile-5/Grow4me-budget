import { useState } from "react";
import { Download, Plus, Target, CheckCircle, Activity, X, Check, WifiOff } from "lucide-react";
import { useRevenues, useCreateSale, useBudgets } from "@/hooks/use-budgets";
import { useOfflineFallback } from "@/hooks/use-offline-fallback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Stat, fmtK, fmtC, pct } from "@/components/gfm/primitives";
import { Coins } from "lucide-react";
import { toast } from "sonner";

function RecordSaleModal({ onClose }: { onClose: () => void }) {
  const { data: budgets = [] } = useBudgets();
  const createSale = useCreateSale();

  const [budgetId, setBudgetId] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [buyer, setBuyer] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [submitting, setSubmitting] = useState(false);

  const total = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetId || !product || !quantity || !pricePerUnit || !buyer) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await createSale.mutateAsync({
        budget: budgetId,
        product,
        quantity: Number(quantity),
        price_per_unit: Number(pricePerUnit),
        date,
        buyer,
        payment_status: paymentStatus,
      });
      toast.success("Sale recorded successfully.");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to record sale.");
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
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--gfm-ink-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Record Sale</div>
            <div className="gfm-muted" style={{ fontSize: 13, marginTop: 3 }}>Log a sale against a budget.</div>
          </div>
          <button className="gfm-icon-btn" style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--gfm-ink-200)" }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Budget <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <select className="gfm-select" value={budgetId} onChange={e => setBudgetId(e.target.value)} required>
              <option value="">Select a budget…</option>
              {budgets.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Product / crop <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <input className="gfm-input" placeholder="e.g. Maize, Tomatoes…" value={product} onChange={e => setProduct(e.target.value)} required />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Quantity <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input className="gfm-input" type="number" min="0" step="0.01" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Price per unit (₵) <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input className="gfm-input" type="number" min="0" step="0.01" placeholder="0.00" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required />
            </label>
          </div>

          {total > 0 && (
            <div style={{ padding: "10px 14px", background: "var(--gfm-green-50)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "var(--gfm-green-700)" }}>
              Total: {fmtC(total)}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Buyer <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input className="gfm-input" placeholder="Buyer name" value={buyer} onChange={e => setBuyer(e.target.value)} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Date <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
              <input className="gfm-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Payment status</span>
            <select className="gfm-select" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, borderTop: "1px solid var(--gfm-ink-100)", marginTop: 4 }}>
            <button type="button" className="gfm-btn gfm-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="gfm-btn gfm-btn-primary" disabled={submitting}>
              {submitting
                ? <><div className="gfm-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                : <><Check size={14} />Record sale</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function exportRevenueCSV(revenues: any[]) {
  const header = ["Date", "Product", "Buyer", "Budget", "Quantity", "Total", "Status"];
  const rows = revenues.map((r: any) => [
    new Date(r.date).toLocaleDateString("en-GB"),
    (r.product ?? r.product_name ?? "").replace(/,/g, ";"),
    (r.buyer ?? "").replace(/,/g, ";"),
    (r.budget_name ?? "").replace(/,/g, ";"),
    r.quantity ?? 0,
    Number(r.total ?? 0).toFixed(2),
    r.status ?? "",
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `revenue_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RevenuePage() {
  const isOnline = useOnlineStatus();
  const { data: revenuesRaw, isLoading } = useRevenues();
  const { data: revenues, usingCache, lastSynced } = useOfflineFallback(["revenues"], revenuesRaw, []);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [showModal, setShowModal] = useState(false);

  const list = [...(revenues as any[])].reverse();
  const totalSum = list.reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
  const paid     = list.filter((r: any) => r.status === "paid").reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
  const pend     = totalSum - paid;
  const paidPct  = pct(paid, totalSum);

  const topBuyer = (() => {
    const m: Record<string, number> = {};
    list.forEach((r: any) => { m[r.buyer ?? "Unknown"] = (m[r.buyer ?? "Unknown"] || 0) + Number(r.total ?? 0); });
    const sorted = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return sorted[0];
  })();

  const filtered = filter === "all" ? list : list.filter((r: any) => r.status === filter);

  return (
    <div className="gfm-page">
      {showModal && <RecordSaleModal onClose={() => setShowModal(false)} />}

      {usingCache && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "#92400e" }}>
          <WifiOff size={13} />Showing cached data · Last synced: {lastSynced}
        </div>
      )}

      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Revenue & sales</h1>
          <div className="gfm-h1-sub">Sales recorded against each farm.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-ghost" onClick={() => exportRevenueCSV(list)}><Download size={13} />Export</button>
          <button className="gfm-btn gfm-btn-primary" disabled={!isOnline} onClick={() => setShowModal(true)}><Plus size={13} />Record sale</button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Coins size={16} />}       tone="green" label="Total revenue" value={fmtK(totalSum)} sub={`${list.length} sales`} delta="12.4" />
        <Stat icon={<CheckCircle size={16} />} tone="green" label="Received"      value={fmtK(paid)}     sub={`${paidPct}% of total`} />
        <Stat icon={<Activity size={16} />}    tone="amber" label="Pending"       value={fmtK(pend)}     sub={`${list.filter((r: any) => r.status !== "paid").length} buyers`} />
        <Stat icon={<Target size={16} />}      tone="ink"   label="Top buyer"
          value={topBuyer ? topBuyer[0] : "—"} sub={topBuyer ? `${fmtC(topBuyer[1])}` : "No data"} />
      </div>

      <div className="gfm-card">
        <div className="gfm-card-head">
          <div><h3>All sales</h3><div className="sub">Linked to budgets and inventory</div></div>
          <div className="gfm-seg">
            <button className={filter === "all"     ? "active" : ""} onClick={() => setFilter("all")}>All</button>
            <button className={filter === "paid"    ? "active" : ""} onClick={() => setFilter("paid")}>Paid</button>
            <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
          </div>
        </div>
        <div style={{ padding: "0 10px 8px" }}>
          {isLoading && !usingCache ? (
            <div style={{ padding: 32, display: "grid", placeItems: "center" }}><div className="gfm-spinner" /></div>
          ) : !isOnline && list.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <WifiOff size={24} style={{ margin: "0 auto 10px", color: "var(--gfm-ink-400)" }} />
              <div style={{ fontWeight: 700, color: "var(--gfm-ink-600)", marginBottom: 4 }}>No data available offline</div>
              <div style={{ fontSize: 13, color: "var(--gfm-ink-400)" }}>Connect to view revenue.</div>
            </div>
          ) : filtered.length > 0 ? (
            <table className="gfm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Date</th>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Budget</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ paddingRight: 20 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id}>
                    <td className="gfm-num gfm-muted" style={{ paddingLeft: 20 }}>
                      {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.product ?? r.product_name ?? "—"}</td>
                    <td className="gfm-muted">{r.buyer ?? "—"}</td>
                    <td><span className="gfm-badge">{r.budget_name ?? "—"}</span></td>
                    <td className="gfm-num" style={{ textAlign: "right" }}>{r.quantity ?? "—"}</td>
                    <td className="gfm-num" style={{ textAlign: "right", fontWeight: 800 }}>{fmtC(Number(r.total))}</td>
                    <td style={{ paddingRight: 20 }}>
                      <span className={`gfm-badge ${r.status === "paid" ? "ok" : "warn"}`}>
                        <span className="dot" />{r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>
              No {filter !== "all" ? filter : ""} sales recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
