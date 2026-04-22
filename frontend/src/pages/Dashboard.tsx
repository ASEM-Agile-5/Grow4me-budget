import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Receipt, Coins, Activity, CalendarDays, ArrowUpRight, ArrowRight, WifiOff, Clock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useDashboardSummary, useMonthlyExpenses, useExpenses, useRevenues } from "@/hooks/use-budgets";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Stat, Hero, PaceCard, SectionHead, fmtK, fmtC, pct, catColor } from "@/components/gfm/primitives";
import { AreaLine, RadialBars, Donut } from "@/components/gfm/charts";

const YEAR = new Date().getFullYear();
const CACHE_KEY = "gfm_summary_cache";

interface SummaryCache {
  data: Record<string, any>;
  cached_at: string;
}

function getSummaryCache(): SummaryCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSummaryCache(data: Record<string, any>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cached_at: new Date().toISOString() }));
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const isOnline = useOnlineStatus();
  const firstName = user?.first_name ?? "there";

  const { data: summary } = useDashboardSummary(YEAR);
  const { data: monthly } = useMonthlyExpenses(YEAR);
  const { data: expenses = [] } = useExpenses();
  const { data: revenues = [] } = useRevenues();

  // Persist summary to cache whenever fresh data arrives
  useEffect(() => {
    if (summary && Object.keys(summary).length > 0) {
      setSummaryCache(summary);
    }
  }, [summary]);

  // Use live data if available, fall back to cache when offline
  const cache = getSummaryCache();
  const effectiveSummary = summary ?? (isOnline ? null : cache?.data ?? null);
  const usingCache = !summary && !!cache;

  const planned = Number(effectiveSummary?.["Total Budget"] ?? 0);
  const revenue = Number(effectiveSummary?.["Revenue"] ?? 0);
  const net     = Number(effectiveSummary?.["Net Profit"] ?? 0);
  const actual  = expenses.reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);
  const revPend = revenues.filter((r: any) => r.status !== "paid").reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
  const utilPct = pct(actual, planned);
  const expected = Math.round(planned * 0.45);

  const catTot: Record<string, number> = {};
  expenses.forEach((e: any) => { catTot[e.category_name] = (catTot[e.category_name] || 0) + Number(e.amount ?? 0); });
  const cats = Object.entries(catTot)
    .map(([k, v]) => ({ label: k, v, color: catColor(k) }))
    .sort((a, b) => b.v - a.v);

  const recent = [...expenses].reverse().slice(0, 5);
  const monthlyData = monthly && !Array.isArray(monthly)
    ? Object.entries(monthly).map(([k, v]) => ({ m: k.slice(0, 3), v: Number(v) }))
    : Array.isArray(monthly)
      ? (monthly as any[]).map((m: any) => ({ m: String(m.month ?? m.m ?? "").slice(0, 3), v: Number(m.total ?? m.v ?? 0) }))
      : [];

  const radial = [
    { label: "Used",    pct: Math.min(utilPct, 100), color: "#16A34A" },
    { label: "Revenue", pct: planned > 0 ? Math.min(pct(revenue, planned), 100) : 0, color: "#F59E0B" },
  ];

  const noDataOffline = !isOnline && !cache && !summary;

  return (
    <div className="gfm-page">
      {/* Offline / cache banners */}
      {!isOnline && !noDataOffline && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#92400e" }}>
          <WifiOff size={15} />
          You're offline.
          {usingCache && cache && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 4 }}>
              <Clock size={12} />Last synced: {timeAgo(cache.cached_at)}
            </span>
          )}
        </div>
      )}

      {noDataOffline && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 28px", background: "var(--gfm-ink-50)", border: "1px solid var(--gfm-ink-100)", borderRadius: 16, textAlign: "center" }}>
          <WifiOff size={32} style={{ color: "var(--gfm-ink-400)" }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gfm-ink-700)" }}>No data available offline</div>
          <div style={{ fontSize: 13, color: "var(--gfm-ink-500)" }}>
            Connect to the internet to load your dashboard. Data will be cached for future offline use.
          </div>
        </div>
      )}

      {/* Cached data label */}
      {usingCache && cache && isOnline === false && (
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gfm-ink-400)", textAlign: "right" }}>
          Showing cached data · Last synced: {timeAgo(cache.cached_at)}
        </div>
      )}

      <Hero
        name={firstName}
        sub={`${effectiveSummary?.active_budgets ?? "—"} active budgets · ₵${(actual / 1000).toFixed(1)}k spent this season. Let's grow today.`}
        weather={{ t: 28, label: "Partly sunny · Accra" }}
        right={
          <>
            <button className="gfm-pill"><CalendarDays size={12} />This season</button>
            <button className="gfm-btn gfm-btn-amber gfm-btn-arrow" onClick={() => navigate("/reports")}>
              Reports <span className="cap"><ArrowUpRight size={14} /></span>
            </button>
          </>
        }
      />

      <div className="gfm-grid gfm-grid-4">
        <Stat icon={<Wallet size={16} />}   tone="green" label="Total budget"   value={fmtK(planned)}  sub={usingCache ? "cached" : "across active farms"} />
        <Stat icon={<Receipt size={16} />}  tone="amber" label="Spent · season" value={fmtK(actual)}   sub={`${utilPct}% of plan`} />
        <Stat icon={<Coins size={16} />}    tone="ink"   label="Revenue"        value={fmtK(revenue)}  sub={usingCache ? "cached · " + timeAgo(cache!.cached_at) : (revPend > 0 ? `${fmtK(revPend)} pending` : "season total")} delta={usingCache ? undefined : "8.4"} />
        <Stat icon={<Activity size={16} />} tone={net >= 0 ? "green" : "pink"}  label="Net P&L"        value={(net >= 0 ? "+" : "−") + fmtK(Math.abs(net))} sub={usingCache ? "cached" : "season-to-date"} />
      </div>

      <div className="gfm-grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="gfm-card">
          <div className="gfm-card-head">
            <div><h3>Spending trend</h3><div className="sub">Monthly expenses this year</div></div>
            <div className="gfm-seg"><button className="active">Season</button><button>YTD</button></div>
          </div>
          <div style={{ padding: "4px 18px 18px" }}>
            {monthlyData.length > 0
              ? <AreaLine data={monthlyData} width={760} height={240}
                  format={v => v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v)} />
              : <div style={{ height: 240, display: "grid", placeItems: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>
                  {!isOnline ? "Monthly trend unavailable offline" : "No expense data yet"}
                </div>
            }
          </div>
        </div>

        <div className="gfm-card gfm-card-p">
          <SectionHead title="Budget overview" sub={usingCache ? `Cached · ${timeAgo(cache!.cached_at)}` : "Utilisation vs revenue"} />
          <RadialBars data={radial} width={300} height={190} centerBig={fmtK(actual)} centerSub="Total spent" />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11, color: "var(--gfm-ink-600)", fontWeight: 600, flexWrap: "wrap", marginTop: 8 }}>
            {radial.map(r => (
              <span key={r.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: r.color }} />{r.label} {r.pct}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="gfm-grid" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        <PaceCard title="Season pace" actual={actual} planned={planned} expected={expected}
          label={`${utilPct}% of plan used`} />

        <div className="gfm-card gfm-card-p">
          <SectionHead title="Where money's going" sub="Season-to-date by category" />
          {cats.length > 0 ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Donut data={cats} size={160} stroke={22} centerTop="SPENT" centerBig={fmtK(actual)} centerSub="GHS" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {cats.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />
                    <span style={{ color: "var(--gfm-ink-800)", fontWeight: 600 }}>{c.label}</span>
                    <span className="gfm-num gfm-muted" style={{ marginLeft: "auto", fontWeight: 700 }}>{fmtC(c.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="gfm-empty">No expenses logged yet</div>
          )}
        </div>
      </div>

      <div className="gfm-card">
        <div className="gfm-card-head">
          <div><h3>Recent expenses</h3><div className="sub">Latest transactions</div></div>
          <button className="gfm-btn gfm-btn-ghost gfm-btn-sm" onClick={() => navigate("/expenses")}>
            View all <ArrowRight size={11} />
          </button>
        </div>
        <div style={{ padding: "0 10px 6px" }}>
          {recent.length > 0 ? (
            <table className="gfm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Date</th>
                  <th>Category</th>
                  <th>Notes</th>
                  <th style={{ textAlign: "right", paddingRight: 20 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e: any) => (
                  <tr key={e.id}>
                    <td className="gfm-num gfm-muted" style={{ paddingLeft: 20 }}>
                      {new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </td>
                    <td>
                      <span className="gfm-cat">
                        <span className="sw" style={{ background: catColor(e.category_name) }} />
                        {e.category_name}
                      </span>
                    </td>
                    <td className="gfm-muted" style={{ maxWidth: 280 }}>{e.notes}</td>
                    <td className="gfm-num" style={{ textAlign: "right", paddingRight: 20, fontWeight: 800 }}>
                      {fmtC(Number(e.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--gfm-ink-400)", fontSize: 13 }}>
              {!isOnline ? "Expenses unavailable offline" : "No expenses yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
