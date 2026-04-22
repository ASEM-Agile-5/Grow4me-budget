import { Plus, Upload, Info, Truck, Box, Coins, WifiOff } from "lucide-react";
import { useInventory } from "@/hooks/use-budgets";
import { useOfflineFallback } from "@/hooks/use-offline-fallback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Stat, HBar, fmtK, fmtC } from "@/components/gfm/primitives";

export default function Inventory() {
  const isOnline = useOnlineStatus();
  const { data: inventoryRaw, isLoading } = useInventory();
  const { data: inventory, usingCache, lastSynced } = useOfflineFallback(["inventory"], inventoryRaw, []);

  const list = inventory as any[];
  const low   = list.filter(i => Number(i.current_stock ?? 0) < Number(i.minimum_stock ?? 0)).length;
  const total = list.reduce((s, i) => s + Number(i.current_stock ?? 0), 0);

  return (
    <div className="gfm-page">
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
          <button className="gfm-btn gfm-btn-ghost" disabled={!isOnline}><Upload size={13} />Adjust stock</button>
          <button className="gfm-btn gfm-btn-primary" disabled={!isOnline}><Plus size={13} />New item</button>
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
            <button className="active">All</button>
            <button>Low</button>
            <button>OK</button>
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
          ) : list.length > 0 ? (
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
                {list.map((i: any) => {
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
                      <td><HBar planned={min * 2} actual={stock} /></td>
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
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>No inventory items yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
