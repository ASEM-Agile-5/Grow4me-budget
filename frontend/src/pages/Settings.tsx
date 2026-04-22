import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { SectionHead } from "@/components/gfm/primitives";

const SECTIONS = ["Profile", "Farm defaults", "Categories", "Notifications", "Billing", "Team"];

export default function Settings() {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState("Profile");
  const [notifs, setNotifs] = useState([
    { label: "Budget exceeds 85%",   on: true  },
    { label: "Expense over ₵1,000",  on: true  },
    { label: "Low stock alerts",     on: true  },
    { label: "Weekly summary email", on: false },
  ]);

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? "U"}`.toUpperCase();

  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Settings</h1>
          <div className="gfm-h1-sub">Your account, farm defaults and notifications.</div>
        </div>
        <div className="gfm-page-actions">
          <button className="gfm-btn gfm-btn-primary"><Check size={13} />Save changes</button>
        </div>
      </div>

      <div className="gfm-grid" style={{ gridTemplateColumns: "240px 1fr" }}>
        {/* Settings nav */}
        <div className="gfm-card gfm-card-p">
          {SECTIONS.map((s) => (
            <button key={s} className={`gfm-nav-item ${activeSection === s ? "active" : ""}`}
              style={{ marginBottom: 2 }} onClick={() => setActiveSection(s)}>
              <ChevronRight size={12} /><span>{s}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Profile */}
          <div className="gfm-card gfm-card-p">
            <SectionHead title="Profile" sub="How other farmers see you" />
            <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "14px 0 18px", borderBottom: "1px solid var(--gfm-ink-100)" }}>
              <div className="gfm-avatar" style={{ width: 72, height: 72, fontSize: 22 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{user?.first_name} {user?.last_name}</div>
                <div className="gfm-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{user?.email} · Farmer plan</div>
              </div>
              <button className="gfm-btn gfm-btn-ghost gfm-btn-sm">Change photo</button>
            </div>
            <div className="gfm-grid gfm-grid-2" style={{ gap: 14, marginTop: 18 }}>
              {[
                { l: "First name",  v: user?.first_name ?? "" },
                { l: "Last name",   v: user?.last_name  ?? "" },
                { l: "Email",       v: user?.email      ?? "" },
                { l: "Phone",       v: user?.phone      ?? "" },
              ].map(f => (
                <label key={f.l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="gfm-label">{f.l}</span>
                  <input className="gfm-input" defaultValue={f.v} />
                </label>
              ))}
            </div>
          </div>

          {/* Farm defaults */}
          <div className="gfm-card gfm-card-p">
            <SectionHead title="Farm defaults" sub="Applied to every new budget you create" />
            <div className="gfm-grid gfm-grid-2" style={{ gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="gfm-label">Currency</span>
                <select className="gfm-select">
                  <option>Ghanaian cedi (₵)</option>
                  <option>Nigerian naira (₦)</option>
                  <option>US dollar ($)</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="gfm-label">Season length</span>
                <select className="gfm-select">
                  <option>6 months</option>
                  <option>12 months</option>
                  <option>Custom</option>
                </select>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="gfm-card gfm-card-p">
            <SectionHead title="Notifications" />
            {notifs.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < notifs.length - 1 ? "1px solid var(--gfm-ink-100)" : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                <button
                  className={`gfm-toggle ${r.on ? "on" : ""}`}
                  onClick={() => setNotifs(prev => prev.map((n, j) => j === i ? { ...n, on: !n.on } : n))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
