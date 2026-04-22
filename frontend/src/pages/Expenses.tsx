import { useState } from "react";
import { Download, Plus, Filter, CalendarDays, Search } from "lucide-react";
import { useExpenses } from "@/hooks/use-budgets";
import { Stat, fmtK, fmtC, catColor } from "@/components/gfm/primitives";
import { Receipt, Wallet, Activity } from "lucide-react";

export default function Expenses() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [search, setSearch] = useState("");

  const list = [...expenses].reverse();
  const filtered = search
    ? list.filter((e: any) => (e.notes ?? "").toLowerCase().includes(search.toLowerCase()) || (e.category_name ?? "").toLowerCase().includes(search.toLowerCase()))
    : list;

  const totalSum = list.reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);

  const thisWeek = list.filter((e: any) => {
    const d = new Date(e.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);

  const catTot: Record<string, number> = {};
  list.forEach((e: any) => { catTot[e.category_name] = (catTot[e.category_name] || 0) + Number(e.amount ?? 0); });
  const topCat = Object.entries(catTot).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Expenses</h1>
          <div className="gfm-h1-sub">Every coin spent, tied to a budget.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-ghost"><Download size={13} />Export CSV</button>
          <button className="gfm-btn gfm-btn-primary"><Plus size={13} />Log expense</button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Receipt size={16} />} tone="green" label="Total expenses"  value={fmtK(totalSum)} sub={`${list.length} entries`} />
        <Stat icon={<Wallet size={16} />}  tone="amber" label="This week"       value={fmtK(thisWeek)} sub="last 7 days" />
        <Stat icon={<Activity size={16} />} tone="ink"  label="Avg / day"       value={fmtK(Math.round(totalSum / 30))} sub="Last 30 days" />
        <Stat icon={<Filter size={16} />}  tone="blue"  label="Top category"
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
