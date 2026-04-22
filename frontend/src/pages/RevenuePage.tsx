import { useState } from "react";
import { Download, Plus, Target, CheckCircle, Activity } from "lucide-react";
import { useRevenues, useCreateSale } from "@/hooks/use-budgets";
import { Stat, fmtK, fmtC, pct } from "@/components/gfm/primitives";
import { Coins } from "lucide-react";

export default function RevenuePage() {
  const { data: revenues = [], isLoading } = useRevenues();
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const list = [...revenues].reverse();
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
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Revenue & sales</h1>
          <div className="gfm-h1-sub">Sales recorded against each farm.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-ghost"><Download size={13} />Export</button>
          <button className="gfm-btn gfm-btn-primary"><Plus size={13} />Record sale</button>
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
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
            <button className={filter === "paid" ? "active" : ""} onClick={() => setFilter("paid")}>Paid</button>
            <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
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
