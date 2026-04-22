import { useState } from "react";
import { Download, Activity, Wallet, Coins, Target } from "lucide-react";
import { useBudgets, useMonthlyExpenses, useRevenues, useExpenses } from "@/hooks/use-budgets";
import { Stat, SectionHead, fmtK, pct, catColor } from "@/components/gfm/primitives";
import { AreaLine, GroupedBars, Donut } from "@/components/gfm/charts";

const YEAR = new Date().getFullYear();

export default function Reports() {
  const { data: budgets = [] }  = useBudgets();
  const { data: monthly = [] }  = useMonthlyExpenses(YEAR);
  const { data: revenues = [] } = useRevenues();
  const { data: expenses = [] } = useExpenses();

  const planned = budgets.reduce((s: number, b: any) => s + Number(b.planned ?? 0), 0);
  const actual  = budgets.reduce((s: number, b: any) => s + Number(b.spent   ?? 0), 0);
  const revenue = revenues.filter((r: any) => r.status === "paid").reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
  const net     = revenue - actual;
  const utilPct = pct(actual, planned);

  const catTot: Record<string, { planned: number; actual: number }> = {};
  expenses.forEach((e: any) => {
    const k = e.category_name ?? "Other";
    if (!catTot[k]) catTot[k] = { planned: 0, actual: 0 };
    catTot[k].actual += Number(e.amount ?? 0);
  });
  const groupedData = Object.entries(catTot).map(([k, v]) => ({ label: k.slice(0, 8), ...v }));

  const monthlyData = Array.isArray(monthly)
    ? monthly.map((m: any) => ({ m: String(m.month ?? m.m ?? "").slice(0, 3), v: Number(m.total ?? m.v ?? 0) }))
    : [];

  const donutData = budgets.slice(0, 3).map((b: any, i: number) => ({
    v: Number(b.spent ?? 0),
    color: ["#16A34A", "#F59E0B", "#0EA5E9"][i] ?? "#9ca3af",
    label: b.name,
  }));

  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Reports & analytics</h1>
          <div className="gfm-h1-sub">Financial health across every farm.</div>
        </div>
        <div className="gfm-page-actions">
          <div className="gfm-seg">
            <button className="active">Season</button>
            <button>YTD</button>
            <button>12 mo</button>
          </div>
          <button className="gfm-btn gfm-btn-ghost"><Download size={13} />PDF</button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Activity size={16} />} tone={net >= 0 ? "green" : "pink"} label="Net P&L"
          value={(net >= 0 ? "+" : "−") + fmtK(Math.abs(net))} sub="season-to-date" delta="14.2" />
        <Stat icon={<Wallet size={16} />}  tone="amber" label="Utilisation"   value={utilPct + "%"} sub="of plan" />
        <Stat icon={<Coins size={16} />}   tone="ink"   label="Rev / expense"
          value={actual > 0 ? (revenue / actual).toFixed(2) + "x" : "—"} sub="higher is better" />
        <Stat icon={<Target size={16} />}  tone="green" label="Return on plan"
          value={planned > 0 ? Math.round((net / planned) * 100) + "%" : "—"} sub="profit ÷ planned" />
      </div>

      {groupedData.length > 0 && (
        <div className="gfm-card">
          <div className="gfm-card-head">
            <div><h3>Plan vs actual — by category</h3><div className="sub">Grey = planned · green = on/under · red = over</div></div>
          </div>
          <div style={{ padding: "4px 20px 20px" }}>
            <GroupedBars data={groupedData} width={1080} height={280} />
          </div>
        </div>
      )}

      <div className="gfm-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="gfm-card">
          <div className="gfm-card-head"><div><h3>Expense trend</h3><div className="sub">Monthly actuals this year</div></div></div>
          <div style={{ padding: "4px 18px 18px" }}>
            {monthlyData.length > 0
              ? <AreaLine data={monthlyData} width={700} height={240}
                  format={v => v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v)} />
              : <div style={{ height: 200, display: "grid", placeItems: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>No data yet</div>
            }
          </div>
        </div>

        <div className="gfm-card gfm-card-p">
          <SectionHead title="Revenue by budget" sub="Paid sales season-to-date" />
          {donutData.length > 0 && revenue > 0 ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Donut data={donutData} size={170} stroke={24} centerTop="REVENUE" centerBig={fmtK(revenue)} centerSub="GHS" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {donutData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} />
                    <span style={{ color: "var(--gfm-ink-800)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                    <span className="gfm-num gfm-muted" style={{ marginLeft: "auto", fontWeight: 700 }}>{fmtK(d.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="gfm-empty">No revenue data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
