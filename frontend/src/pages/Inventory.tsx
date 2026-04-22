import { Plus, Upload, Info, Truck, Box, Coins } from "lucide-react";
import { useInventory } from "@/hooks/use-budgets";
import { Stat, HBar, fmtK, fmtC } from "@/components/gfm/primitives";

export default function Inventory() {
  const { data: inventory = [], isLoading } = useInventory();

  const list = inventory as any[];
  const low   = list.filter(i => Number(i.current_stock ?? 0) < Number(i.minimum_stock ?? 0)).length;
  const total = list.reduce((s, i) => s + Number(i.current_stock ?? 0), 0);

  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Inventory</h1>
          <div className="gfm-h1-sub">Stock across farms, linked to budget line items.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-ghost"><Upload size={13} />Adjust stock</button>
          <button className="gfm-btn gfm-btn-primary"><Plus size={13} />New item</button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Box size={16} />}   tone="green" label="SKUs tracked"    value={list.length}       sub="active items" />
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
          {isLoading ? (
            <div style={{ padding: 32, display: "grid", placeItems: "center" }}><div className="gfm-spinner" /></div>
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
