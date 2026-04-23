import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Pencil, X } from "lucide-react";
import { expenseCategories } from "@/lib/mock-data";
import { fmtC } from "@/components/gfm/primitives";

export interface PreviewBudgetItem {
  id: string;
  category: string;
  category_id: string;
  planned_amount: number;
  category_name: string;
  description: string;
  inventory: boolean;
  quantity: number;
  units: string;
}

interface BudgetPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: PreviewBudgetItem[];
  onConfirm: (items: PreviewBudgetItem[]) => void;
  loading?: boolean;
}

const BudgetPreviewModal = ({
  open,
  onOpenChange,
  title,
  description,
  items: initialItems,
  onConfirm,
  loading = false,
}: BudgetPreviewModalProps) => {
  const [items, setItems] = useState<PreviewBudgetItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPlanned, setNewPlanned] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => { setItems(initialItems); }, [open, initialItems]);

  if (!open) return null;

  const total = items.reduce((s, i) => s + i.planned_amount, 0);

  const handleAdd = () => {
    if (!newCategory || !newPlanned) return;
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      category: newCategory,
      category_id: newCategory,
      category_name: newCategory,
      planned_amount: Number(newPlanned),
      description: newDescription,
      inventory: false,
      quantity: 0,
      units: "units",
    }]);
    setNewCategory("");
    setNewPlanned("");
    setNewDescription("");
  };

  const handleRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const startEdit = (id: string, current: number) => { setEditingId(id); setEditValue(String(current)); };

  const commitEdit = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, planned_amount: Number(editValue) || 0 } : i));
    setEditingId(null);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <div
        className="gfm-card"
        style={{ width: "min(740px, 95vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}
      >
        {/* Modal header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--gfm-ink-100)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gfm-ink-900)" }}>{title}</div>
            {description && <div className="gfm-muted" style={{ fontSize: 13, marginTop: 4 }}>{description}</div>}
          </div>
          <button
            className="gfm-icon-btn"
            style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--gfm-ink-200)", flex: "none" }}
            onClick={() => onOpenChange(false)}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 8px" }}>
          <table className="gfm-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 14 }}>Category</th>
                <th>Notes</th>
                <th style={{ textAlign: "right" }}>Planned</th>
                <th style={{ textAlign: "right", paddingRight: 14 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id}>
                    <td style={{ paddingLeft: 14, fontWeight: 700 }}>{item.category_name}</td>
                    <td className="gfm-muted" style={{ fontSize: 12 }}>
                      {item.description && <span style={{ fontStyle: "italic" }}>"{item.description}"</span>}
                      {item.inventory && <span style={{ display: "block", fontWeight: 600, color: "var(--gfm-green-600)" }}>Inv: {item.quantity} {item.units}</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          className="gfm-input"
                          style={{ width: 90, textAlign: "right", padding: "4px 8px", fontSize: 13 }}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(item.id)}
                          onKeyDown={e => e.key === "Enter" && commitEdit(item.id)}
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <span className="gfm-num" style={{ fontWeight: 800 }}>{fmtC(item.planned_amount)}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: 14 }}>
                      <div style={{ display: "inline-flex", gap: 4 }}>
                        <button
                          className="gfm-icon-btn"
                          style={{ width: 28, height: 28, borderRadius: 8 }}
                          onClick={() => startEdit(item.id, item.planned_amount)}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="gfm-icon-btn"
                          style={{ width: 28, height: 28, borderRadius: 8, color: "var(--gfm-danger)" }}
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "28px 0", color: "var(--gfm-ink-400)", fontSize: 13 }}>
                    No items yet. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Add row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "12px 4px 4px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="gfm-label">Category</span>
              <select className="gfm-select" style={{ height: 36 }} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                <option value="">Select…</option>
                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ width: 100, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="gfm-label">Amount</span>
              <input
                type="number"
                className="gfm-input"
                style={{ height: 36, padding: "4px 10px" }}
                value={newPlanned}
                onChange={e => setNewPlanned(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
            <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="gfm-label">Notes</span>
              <input
                className="gfm-input"
                style={{ height: 36, padding: "4px 10px" }}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
            <button
              className="gfm-btn gfm-btn-ghost"
              style={{ height: 36, padding: "0 14px", flex: "none" }}
              onClick={handleAdd}
              disabled={!newCategory || !newPlanned}
            >
              <Plus size={14} />Add
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--gfm-ink-100)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gfm-ink-50)" }}>
          <div>
            <div className="gfm-label" style={{ marginBottom: 2 }}>Total budget</div>
            <div className="gfm-num" style={{ fontSize: 18, fontWeight: 800, color: "var(--gfm-ink-900)" }}>{fmtC(total)}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gfm-btn gfm-btn-ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </button>
            <button
              className="gfm-btn gfm-btn-primary"
              onClick={() => { onConfirm(items); onOpenChange(false); }}
              disabled={items.length === 0 || loading}
            >
              {loading
                ? <><div className="gfm-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Creating…</>
                : <><Check size={14} />Confirm Budget</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPreviewModal;
