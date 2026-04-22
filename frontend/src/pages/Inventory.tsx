import { useState } from "react";
import { Plus, Upload, Info, Truck, Box, Coins, WifiOff, X, Check } from "lucide-react";
import { useInventory, useAdjustInventory } from "@/hooks/use-budgets";
import { useOfflineFallback } from "@/hooks/use-offline-fallback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Stat, HBar, fmtK, fmtC } from "@/components/gfm/primitives";
import { toast } from "sonner";

function AdjustStockModal({ items, onClose }: { items: any[]; onClose: () => void }) {
  const adjustInventory = useAdjustInventory();
  const [itemId, setItemId] = useState("");
  const [action, setAction] = useState<"add_stock" | "remove_stock">("add_stock");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = items.find(i => i.budget_item?.toString() === itemId || i.id?.toString() === itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) { toast.error("You need an internet connection to adjust stock."); return; }
    if (!itemId || !quantity) { toast.error("Select an item and enter a quantity."); return; }
    setSubmitting(true);
    try {
      await adjustInventory.mutateAsync({
        budget_item: itemId,
        action,
        quantity: Number(quantity),
        notes,
      });
      toast.success(`Stock ${action === "add_stock" ? "added" : "removed"} successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to adjust stock.");
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
            <div style={{ fontWeight: 800, fontSize: 16 }}>Adjust Stock</div>
            <div className="gfm-muted" style={{ fontSize: 13, marginTop: 3 }}>Add or remove stock for an inventory item.</div>
          </div>
          <button className="gfm-icon-btn" style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--gfm-ink-200)" }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Item <span style={{ color: "var(--gfm-danger)" }}>*</span></span>
            <select className="gfm-select" value={itemId} onChange={e => setItemId(e.target.value)} required>
              <option value="">Select an item…</option>
              {items.map((i: any) => (
                <option key={i.id} value={i.budget_item ?? i.id}>
                  {i.name} — {Number(i.current_stock ?? 0)} {i.units} in stock
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="gfm-label" style={{ display: "block", marginBottom: 8 }}>Action</span>
            <div className="gfm-seg">
              <button type="button" className={action === "add_stock" ? "active" : ""} onClick={() => setAction("add_stock")}>Add stock</button>
              <button type="button" className={action === "remove_stock" ? "active" : ""} onClick={() => setAction("remove_stock")}>Remove stock</button>
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">
              Quantity {selected ? `(${selected.units ?? "units"})` : ""} <span style={{ color: "var(--gfm-danger)" }}>*</span>
            </span>
            <input className="gfm-input" type="number" min="1" step="1" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Notes</span>
            <input className="gfm-input" placeholder="Optional reason…" value={notes} onChange={e => setNotes(e.target.value)} />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, borderTop: "1px solid var(--gfm-ink-100)", marginTop: 4 }}>
            <button type="button" className="gfm-btn gfm-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="gfm-btn gfm-btn-primary" disabled={submitting}>
              {submitting
                ? <><div className="gfm-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                : <><Check size={14} />Confirm</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventory() {
  const isOnline = useOnlineStatus();
  const { data: inventoryRaw, isLoading } = useInventory();
  const { data: inventory, usingCache, lastSynced } = useOfflineFallback(["inventory"], inventoryRaw, []);
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "ok">("all");
  const [showAdjust, setShowAdjust] = useState(false);

  const list = inventory as any[];
  const low   = list.filter(i => Number(i.current_stock ?? 0) < Number(i.minimum_stock ?? 0)).length;
  const total = list.reduce((s, i) => s + Number(i.current_stock ?? 0), 0);

  const filtered = stockFilter === "all" ? list
    : stockFilter === "low" ? list.filter(i => Number(i.current_stock ?? 0) < Number(i.minimum_stock ?? 0))
    : list.filter(i => Number(i.current_stock ?? 0) >= Number(i.minimum_stock ?? 0));

  return (
    <div className="gfm-page">
      {showAdjust && <AdjustStockModal items={list} onClose={() => setShowAdjust(false)} />}

      {usingCache && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "#92400e" }}>
          <WifiOff size={13} />Showing cached data · Last synced: {lastSynced}
        </div>
      )}

      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Inventory</h1>
          <div className="gfm-h1-sub">Stock across farms, linked to budget line items.</div>
        </div>
        <div className="gfm-page-actions">
          <button
            className="gfm-btn gfm-btn-ghost"
            onClick={() => isOnline ? setShowAdjust(true) : toast.error("You need an internet connection to adjust stock.")}
          ><Upload size={13} />Adjust stock</button>
          <button
            className="gfm-btn gfm-btn-primary"
            onClick={() => toast.info("New inventory items are created from budget line items. Open a budget and add a line item with inventory tracking enabled.")}
          >
            <Plus size={13} />New item
          </button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Box size={16} />}   tone="green" label="SKUs tracked"    value={list.length}       sub={usingCache ? `cached · ${lastSynced}` : "active items"} />
        <Stat icon={<Coins size={16} />} tone="ink"   label="Total units"     value={total.toLocaleString()} sub="across all farms" />
        <Stat icon={<Info size={16} />}  tone="amber" label="Low stock"       value={low}               sub="below minimum" />
        <Stat icon={<Truck size={16} />} tone="blue"  label="Restocks due"    value={low > 0 ? low : "—"} sub="this week" />
      </div>

      <div className="gfm-card">
        <div className="gfm-card-head">
          <div><h3>Stock by item</h3><div className="sub">Red = below minimum</div></div>
          <div className="gfm-seg">
            <button className={stockFilter === "all" ? "active" : ""} onClick={() => setStockFilter("all")}>All</button>
            <button className={stockFilter === "low" ? "active" : ""} onClick={() => setStockFilter("low")}>Low</button>
            <button className={stockFilter === "ok"  ? "active" : ""} onClick={() => setStockFilter("ok")}>OK</button>
          </div>
        </div>
        <div style={{ padding: "0 10px 8px" }}>
          {isLoading && !usingCache ? (
            <div style={{ padding: 32, display: "grid", placeItems: "center" }}><div className="gfm-spinner" /></div>
          ) : !isOnline && list.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <WifiOff size={24} style={{ margin: "0 auto 10px", color: "var(--gfm-ink-400)" }} />
              <div style={{ fontWeight: 700, color: "var(--gfm-ink-600)", marginBottom: 4 }}>No data available offline</div>
              <div style={{ fontSize: 13, color: "var(--gfm-ink-400)" }}>Connect to view inventory.</div>
            </div>
          ) : filtered.length > 0 ? (
            <table className="gfm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Item</th>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Stock</th>
                  <th style={{ textAlign: "right" }}>Min</th>
                  <th style={{ width: 220 }}>Level</th>
                  <th style={{ paddingRight: 20 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i: any) => {
                  const stock = Number(i.current_stock ?? 0);
                  const min   = Number(i.minimum_stock ?? 0);
                  const isLow = stock < min;
                  return (
                    <tr key={i.id}>
                      <td style={{ paddingLeft: 20, fontWeight: 700 }}>{i.name}</td>
                      <td className="gfm-muted">{i.category_name ?? "—"}</td>
                      <td className="gfm-num" style={{ textAlign: "right", fontWeight: 800, color: isLow ? "var(--gfm-danger)" : "var(--gfm-ink-900)" }}>
                        {stock} {i.units}
                      </td>
                      <td className="gfm-num gfm-muted" style={{ textAlign: "right" }}>{min} {i.units}</td>
                      <td><HBar planned={min * 2 || 10} actual={stock} /></td>
                      <td style={{ paddingRight: 20 }}>
                        <span className={`gfm-badge ${isLow ? "over" : "ok"}`}>
                          <span className="dot" />{isLow ? "Low" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : list.length > 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>
              No {stockFilter} items found.
            </div>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>No inventory items yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
