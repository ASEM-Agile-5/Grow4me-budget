import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Sprout, ArrowRight, WifiOff } from "lucide-react";
import { useProjects, useBudgets } from "@/hooks/use-budgets";
import { useOfflineFallback } from "@/hooks/use-offline-fallback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { HBar, fmtK, pct } from "@/components/gfm/primitives";

export default function Farms() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { data: projectsRaw, isLoading } = useProjects();
  const { data: budgetsRaw } = useBudgets();

  const { data: projects, usingCache, lastSynced } = useOfflineFallback(["projects"], projectsRaw, []);
  const { data: budgets } = useOfflineFallback(["budgets"], budgetsRaw, []);

  return (
    <div className="gfm-page">
      {usingCache && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "#92400e" }}>
          <WifiOff size={13} />Showing cached data · Last synced: {lastSynced}
        </div>
      )}

      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Farms</h1>
          <div className="gfm-h1-sub">Every farm project you manage, active or archived.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-primary" disabled={!isOnline}><Plus size={13} />New farm</button>
        </div>
      </div>

      {isLoading && !usingCache ? (
        <div style={{ display: "grid", placeItems: "center", padding: 48 }}>
          <div className="gfm-spinner" />
        </div>
      ) : !isOnline && (projects as any[]).length === 0 ? (
        <div className="gfm-empty" style={{ padding: "56px 28px" }}>
          <WifiOff size={28} style={{ margin: "0 auto 12px", color: "var(--gfm-ink-400)" }} />
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No data available offline</div>
          <div style={{ fontSize: 13 }}>Connect to the internet to load your farms.</div>
        </div>
      ) : (projects as any[]).length > 0 ? (
        <div className="gfm-grid gfm-grid-3">
          {(projects as any[]).map((p: any) => {
            const farmBudgets = (budgets as any[]).filter(
              (b: any) => b.project === p.name || b.projectId === p.id
            );
            const planned = farmBudgets.reduce((s: number, b: any) => s + Number(b.planned ?? 0), 0);
            const spent   = farmBudgets.reduce((s: number, b: any) => s + Number(b.spent   ?? 0), 0);
            const utilPct = pct(spent, planned);
            return (
              <div key={p.id} className="gfm-card gfm-card-p" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span className="gfm-badge ok"><span className="dot" />active</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{p.name}</div>
                    <div className="gfm-muted" style={{ fontSize: 12, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={11} />{p.region ?? p.location ?? "Ghana"}
                    </div>
                    {p.description && (
                      <div className="gfm-muted" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>{p.description}</div>
                    )}
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gfm-green-50)", color: "var(--gfm-green-600)", display: "grid", placeItems: "center", flex: "none" }}>
                    <Sprout size={20} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "12px 0", borderTop: "1px solid var(--gfm-ink-100)", borderBottom: "1px solid var(--gfm-ink-100)" }}>
                  <div><div className="gfm-label">Size</div><div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{p.size ?? "—"}</div></div>
                  <div><div className="gfm-label">Cycles</div><div className="gfm-num" style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{p.cycles ?? "—"}</div></div>
                  <div><div className="gfm-label">Budgets</div><div className="gfm-num" style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{farmBudgets.length}</div></div>
                </div>

                {planned > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }}>
                      <span className="gfm-muted">This season · {utilPct}% used</span>
                      <span className="gfm-num" style={{ fontWeight: 700 }}>{fmtK(spent)} / {fmtK(planned)}</span>
                    </div>
                    <HBar planned={planned} actual={spent} />
                  </div>
                )}

                <button className="gfm-btn gfm-btn-ghost" style={{ width: "100%" }} onClick={() => navigate("/budgets")}>
                  View budgets <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="gfm-empty" style={{ padding: "64px 28px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gfm-green-50)", color: "var(--gfm-green-600)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Sprout size={26} />
          </div>
          <div style={{ fontWeight: 800, color: "var(--gfm-ink-900)", fontSize: 16, marginBottom: 6 }}>No farms yet</div>
          <div style={{ fontSize: 13, marginBottom: 18 }}>Add a farm to start tracking budgets and expenses.</div>
          <button className="gfm-btn gfm-btn-primary" style={{ margin: "0 auto" }} disabled={!isOnline}><Plus size={13} />Create your first farm</button>
        </div>
      )}
    </div>
  );
}
