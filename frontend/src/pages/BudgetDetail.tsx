import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Download, Edit, Plus, Filter, MoreHorizontal } from "lucide-react";
import { useBudgetDetails, useBudgets } from "@/hooks/use-budgets";
import { Stat, PaceCard, HBar, SectionHead, fmtK, fmtC, fmt, pct, catColor } from "@/components/gfm/primitives";
import { Wallet, Receipt, Coins } from "lucide-react";

export default function BudgetDetail() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { data: budgets = [] } = useBudgets();
  const { data: details, isLoading } = useBudgetDetails(budgetId ?? null);

  const budget = budgets.find((b: any) => b.id?.toString() === budgetId?.toString());
  const items: any[] = details?.items ?? details?.budget_items ?? [];

  const planned  = Number(budget?.planned ?? 0);
  const actual   = Number(budget?.spent   ?? 0);
  const left     = Number(budget?.left    ?? planned - actual);
  const utilPct  = pct(actual, planned);
  const expected = Math.round(planned * 0.67);

  if (isLoading) return (
    <div className="gfm-page" style={{ placeItems: "center" }}>
      <div className="gfm-spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="gfm-page">
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
            <button className="gfm-btn gfm-btn-ghost"><Download size={13} />Export</button>
            <button className="gfm-btn gfm-btn-ghost"><Edit size={13} />Edit</button>
            <button className="gfm-btn gfm-btn-primary"><Plus size={13} />Add line item</button>
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
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gfm-btn gfm-btn-ghost gfm-btn-sm"><Filter size={11} />Category</button>
            <button className="gfm-btn gfm-btn-ghost gfm-btn-sm">Sort: Variance</button>
          </div>
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
                        <button className="gfm-icon-btn" style={{ width: 28, height: 28, border: 0, background: "transparent" }}>
                          <MoreHorizontal size={14} />
                        </button>
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
                <div style={{ fontSize: 12 }}>Add items to track planned vs actual spend.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
