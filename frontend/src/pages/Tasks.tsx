import { useState } from "react";
import { Plus, CalendarDays, Flag, Sprout } from "lucide-react";
import { toast } from "sonner";

const MOCK_TASKS = [
  { id: "t1", title: "Third weeding",          project: "Maize Farm",   due: "2026-04-25", assignee: "Kwabena", status: "upcoming",  priority: "med"  },
  { id: "t2", title: "Order urea top-dress",   project: "Maize Farm",   due: "2026-04-24", assignee: "Ama",     status: "due-today", priority: "high" },
  { id: "t3", title: "Vaccinate layers",        project: "Poultry Unit", due: "2026-04-23", assignee: "Akosua",  status: "overdue",   priority: "high" },
  { id: "t4", title: "Collect eggs",            project: "Poultry Unit", due: "2026-04-22", assignee: "Akosua",  status: "done",      priority: "low"  },
  { id: "t5", title: "Greenhouse fertigation",  project: "Greenhouse",   due: "2026-04-22", assignee: "Ama",     status: "due-today", priority: "med"  },
  { id: "t6", title: "Pick ripe tomatoes",      project: "Greenhouse",   due: "2026-04-22", assignee: "Kofi",    status: "done",      priority: "med"  },
  { id: "t7", title: "Meet buyer – Makola",     project: "Greenhouse",   due: "2026-04-26", assignee: "Ama",     status: "upcoming",  priority: "med"  },
];

const COLS = [
  { key: "overdue",   label: "Overdue",   tone: "over" },
  { key: "due-today", label: "Due today", tone: "warn" },
  { key: "upcoming",  label: "Upcoming",  tone: ""     },
  { key: "done",      label: "Done",      tone: "ok"   },
];

export default function Tasks() {
  return (
    <div className="gfm-page">
      <div className="gfm-page-head">
        <div>
          <h1 className="gfm-h1">Tasks</h1>
          <div className="gfm-h1-sub">Everything that needs doing across the farms.</div>
        </div>
        <div className="gfm-page-actions">
          <div className="gfm-seg">
            <button className="active">Board</button>
            <button>List</button>
            <button>Calendar</button>
          </div>
          <button className="gfm-btn gfm-btn-primary" onClick={() => toast.info("Task creation coming soon — tasks will be linked to farms and budgets.")}><Plus size={13} />Add task</button>
        </div>
      </div>

      <div className="gfm-grid gfm-grid-4">
        {COLS.map(col => {
          const items = MOCK_TASKS.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="gfm-card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
              <div style={{ padding: "16px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`gfm-badge ${col.tone}`}><span className="dot" />{col.label}</span>
                  <span className="gfm-muted" style={{ fontSize: 12, fontWeight: 700 }}>{items.length}</span>
                </div>
                <button className="gfm-icon-btn" style={{ width: 26, height: 26, border: 0 }}><Plus size={13} /></button>
              </div>
              <div style={{ padding: "4px 14px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {items.map(t => (
                  <div key={t.id} className="gfm-card gfm-card-p" style={{ padding: 14, boxShadow: "none", background: col.key === "done" ? "var(--gfm-ink-50)" : "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span className="gfm-badge"><Sprout size={10} />{t.project}</span>
                      {t.priority === "high" && <span className="gfm-badge over"><Flag size={10} />High</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: col.key === "done" ? "var(--gfm-ink-500)" : "var(--gfm-ink-900)", textDecoration: col.key === "done" ? "line-through" : "none" }}>
                      {t.title}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 11.5, color: "var(--gfm-ink-500)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <CalendarDays size={11} />
                        {new Date(t.due).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                      <span style={{ fontWeight: 700, color: "var(--gfm-ink-700)" }}>{t.assignee}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ fontSize: 11.5, color: "var(--gfm-ink-400)", textAlign: "center", padding: "20px 0" }}>Nothing here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
