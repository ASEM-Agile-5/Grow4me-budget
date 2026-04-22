import { useNavigate } from "react-router-dom";
import { Plus, Filter, Sprout, ArrowRight } from "lucide-react";
import { useBudgets } from "@/hooks/use-budgets";
import { PaceBar, HBar, fmtK, pct } from "@/components/gfm/primitives";

export default function Budgets() {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = useBudgets();

  const active = budgets.filter((b: any) => b.status !== "closed" && b.status !== "archived");

  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Budgets</h1>
          <div className="gfm-h1-sub">Plan, track and close out every farm project.</div>
        </div>
        <div className="gfm-page-actions">
          <div className="gfm-seg">
            <button className="active">Active</button>
            <button>All</button>
            <button>Closed</button>
          </div>
          <button className="gfm-btn gfm-btn-ghost"><Filter size={13} />Filter</button>
          <button className="gfm-btn gfm-btn-primary" onClick={() => navigate("/budgets/create")}>
            <Plus size={13} />New budget
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", placeItems: "center", padding: 48 }}>
          <div className="gfm-spinner" />
        </div>
      ) : (
        <div className="gfm-grid gfm-grid-3">
          {active.map((b: any) => {
            const planned = Number(b.planned ?? 0);
            const spent   = Number(b.spent ?? 0);
            const left    = Number(b.left ?? planned - spent);
            const utilPct = pct(spent, planned);
            const over    = utilPct > 100;
            return (
              <div key={b.id} className="gfm-card gfm-card-p"
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 14 }}
                onClick={() => navigate(`/budgets/${b.id}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="gfm-badge"><Sprout size={11} />{b.project}</span>
                    <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 10 }}>{b.name}</div>
                    <div className="gfm-muted" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{b.description}</div>
                  </div>
                  <span className={`gfm-badge ${over ? "over" : utilPct > 85 ? "warn" : "ok"}`}>
                    <span className="dot" />{utilPct}%
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "14px 0", borderTop: "1px solid var(--gfm-ink-100)", borderBottom: "1px solid var(--gfm-ink-100)" }}>
                  <div>
                    <div className="gfm-label">Planned</div>
                    <div className="gfm-num" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", marginTop: 2 }}>{fmtK(planned)}</div>
                  </div>
                  <div>
                    <div className="gfm-label">Spent</div>
                    <div className="gfm-num" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", marginTop: 2 }}>{fmtK(spent)}</div>
                  </div>
                  <div>
                    <div className="gfm-label">{left < 0 ? "Over" : "Left"}</div>
                    <div className="gfm-num" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", marginTop: 2, color: left < 0 ? "var(--gfm-danger)" : "var(--gfm-green-600)" }}>
                      {fmtK(Math.abs(left))}
                    </div>
                  </div>
                </div>

                <PaceBar actual={spent} planned={planned} expected={planned * 0.45} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gfm-ink-500)" }}>
                  <span>{b.year}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "var(--gfm-green-700)" }}>
                    Open <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Create new card */}
          <div className="gfm-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", minHeight: 300 }}
            onClick={() => navigate("/budgets/create")}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--gfm-amber-100)", color: "var(--gfm-amber-600)", display: "grid", placeItems: "center" }}>
              <Plus size={24} />
            </div>
            <div style={{ fontWeight: 800, color: "var(--gfm-ink-900)", fontSize: 14 }}>Create a new budget</div>
            <div style={{ fontSize: 12 }}>Start from template or blank</div>
          </div>
        </div>
      )}
    </div>
  );
}
