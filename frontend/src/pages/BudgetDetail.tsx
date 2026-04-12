import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useBudgets,
  useSelectedBudget,
  useBudgetDetails,
  useRecentExpenses,
  useAddBudgetItem,
  BudgetItem,
} from "@/hooks/use-budgets";
import { getBudgetCategoriesAPI } from "@/services/services";
import { inventoryUnits } from "@/lib/mock-data";

const BudgetDetail = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { setSelectedBudgetId } = useSelectedBudget();

  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: budgetDetails, isLoading: detailsLoading } = useBudgetDetails(
    budgetId || null,
  );
  const { data: expenses = [], isLoading: expensesLoading } = useRecentExpenses(
    budgetId || null,
  );
  const addBudgetItemMutation = useAddBudgetItem();

  const loading = budgetsLoading || detailsLoading || expensesLoading;

  const [apiCategories, setApiCategories] = useState<
    { id: string; category_name: string }[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getBudgetCategoriesAPI();
        setApiCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCats();
  }, []);

  const budget = budgets.find(
    (b: any) => b.id.toString() === budgetId?.toString(),
  );
  const items = useMemo(() => {
    const rawItems = budgetDetails?.budget_items || [];
    // Map rawItems to BudgetItem interface
    const mapped: BudgetItem[] = rawItems.map((it: any) => ({
      id: it.id,
      budgetId: budgetId!,
      category_name: it.category_name,
      planned_amount: it.planned_amount,
      spent: it.spent,
    }));

    // Sort so 'Miscellaneous' is always at the bottom
    return [...mapped].sort((a, b) => {
      if (a.category_name === "Miscellaneous") return 1;
      if (b.category_name === "Miscellaneous") return -1;
      return 0;
    });
  }, [budgetDetails, budgetId]);

  const budgetExpenses = useMemo(() => expenses || [], [expenses]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Expenses modal state
  const [expenseViewItem, setExpenseViewItem] = useState<BudgetItem | null>(
    null,
  );
  const [form, setForm] = useState({
    category: "",
    planned: "",
    description: "",
    trackInventory: "no" as "yes" | "no",
    inventoryUnit: "",
    initialQuantity: "",
  });
  const emptyForm = {
    category: "",
    planned: "",
    description: "",
    trackInventory: "no" as "yes" | "no",
    inventoryUnit: "",
    initialQuantity: "",
  };

  // Detail modal state
  const [detailItem, setDetailItem] = useState<BudgetItem | null>(null);

  useEffect(() => {
    if (budgetId) setSelectedBudgetId(budgetId);
  }, [budgetId, setSelectedBudgetId]);

  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Loading budget details...
        </p>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/budgets")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Budgets
        </Button>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center">
          <p className="text-lg font-semibold text-muted-foreground">
            Budget not found
          </p>
        </div>
      </div>
    );
  }

  const totalPlanned = budgetDetails?.total_planned || 0;
  const totalActual = items.reduce((s, b) => s + b.spent, 0); // Keep for progress bars if needed, or sync with totalSpent
  const totalSpent = budgetDetails?.total_spent || 0;
  const variance = budgetDetails?.variance || 0;

  const handleSave = async () => {
    if (!form.category || !form.planned) return;
    setIsSaving(true);
    const isTracked = form.trackInventory === "yes";
    try {
      if (editItem) {
        // Redacted for now
      } else {
        await addBudgetItemMutation.mutateAsync({
          budget: budget.id,
          category: form.category,
          planned_amount: Number(form.planned),
          inventory: isTracked,
          quantity:
            isTracked && form.initialQuantity
              ? Number(form.initialQuantity)
              : undefined,
          units: isTracked ? form.inventoryUnit : undefined,
        });
      }
      setForm(emptyForm);
      setEditItem(null);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: BudgetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditItem(item);
    setForm({
      category: item.category_name,
      planned: item.planned_amount.toString(),
      description: "",
      trackInventory: "no",
      inventoryUnit: "",
      initialQuantity: "",
    });
    setDialogOpen(true);
  };

  const handleRowClick = (item: BudgetItem) => {
    if (item.category_name === "Miscellaneous") {
      setExpenseViewItem(item);
    } else {
      setDetailItem(item);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/budgets")}
            id="back-to-budgets"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{budget.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {budget.project}
              </span>
              <span className="text-sm text-muted-foreground">
                {budget.year}
              </span>
              {budget.description && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  — {budget.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Budget Item Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditItem(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button id="add-budget-item-btn">
              <Plus className="mr-2 h-4 w-4" /> Add Budget Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit" : "Add"} Budget Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.category_name}
                      </SelectItem>
                    ))}
                    {apiCategories.length === 0 && (
                      <div className="p-2 text-xs text-muted-foreground italic">
                        No categories found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Planned Amount (GHS)</Label>
                <Input
                  id="item-planned"
                  type="number"
                  min={0}
                  value={form.planned}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, planned: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  id="item-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe what this budget item covers..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Track Inventory</Label>
                <Select
                  value={form.trackInventory}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      trackInventory: v as "yes" | "no",
                      inventoryUnit: v === "no" ? "" : f.inventoryUnit,
                    }))
                  }
                >
                  <SelectTrigger id="item-track-inventory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">
                      Yes — track stock levels
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.trackInventory === "yes" && (
                <>
                  <div>
                    <Label>Inventory Unit</Label>
                    <Select
                      value={form.inventoryUnit}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, inventoryUnit: v }))
                      }
                    >
                      <SelectTrigger id="item-inventory-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryUnits.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      Initial Quantity ({form.inventoryUnit || "units"})
                    </Label>
                    <Input
                      id="item-initial-qty"
                      type="number"
                      min={0}
                      value={form.initialQuantity}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          initialQuantity: e.target.value,
                        }))
                      }
                      placeholder="Starting stock, e.g. 10"
                    />
                  </div>
                </>
              )}
              <Button
                id="save-budget-item-btn"
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Item Detail Modal */}
      <Dialog
        open={!!detailItem}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null);
        }}
      >
        <DialogContent>
          {detailItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {detailItem.category_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Description */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed">
                    No description provided.
                  </p>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Planned
                    </p>
                    <p className="text-lg font-bold">
                      GHS {detailItem.planned_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Actual
                    </p>
                    <p className="text-lg font-bold text-warning">
                      GHS {detailItem.spent.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Variance
                    </p>
                    <p
                      className={`text-lg font-bold ${detailItem.planned_amount - detailItem.spent >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {detailItem.planned_amount - detailItem.spent >= 0
                        ? "+"
                        : ""}
                      GHS{" "}
                      {(
                        detailItem.planned_amount - detailItem.spent
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Utilization</span>
                    <span>
                      {detailItem.planned_amount > 0
                        ? (
                            (detailItem.spent / detailItem.planned_amount) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        detailItem.planned_amount > 0 &&
                        (detailItem.spent / detailItem.planned_amount) * 100 >
                          100
                          ? "bg-destructive"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(
                          detailItem.planned_amount > 0
                            ? (detailItem.spent / detailItem.planned_amount) *
                                100
                            : 0,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Expenses Modal (specifically for Miscellaneous) */}
      <Dialog
        open={!!expenseViewItem}
        onOpenChange={(open) => {
          if (!open) setExpenseViewItem(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          {expenseViewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Expenses for {expenseViewItem.category_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-lg bg-muted/50 p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                      Total Category Spending
                    </p>
                    <p className="text-xl font-bold">
                      GHS {expenseViewItem.spent.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                      Budget Link
                    </p>
                    <p className="text-sm font-medium">{budget.name}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b text-left text-muted-foreground">
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Notes</th>
                        <th className="p-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetExpenses
                        .filter(
                          (e) =>
                            e.category_name === expenseViewItem.category_name,
                        )
                        .map((e) => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="p-3 text-muted-foreground">
                              {new Date(e.date).toLocaleDateString()}
                            </td>
                            <td className="p-3">{e.notes || "-"}</td>
                            <td className="p-3 text-right font-medium">
                              GHS {Number(e.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      {budgetExpenses.filter(
                        (e) =>
                          e.category_name === expenseViewItem.category_name,
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-8 text-center text-muted-foreground"
                          >
                            No expenses recorded yet for this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Budget</p>
          <p className="text-xl font-bold">
            GHS {totalPlanned.toLocaleString()}
          </p>
        </div> */}
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Planned</p>
          <p className="text-xl font-bold">
            GHS {totalPlanned.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-xl font-bold text-warning">
            GHS {totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Variance</p>
          <p
            className={`text-xl font-bold ${variance >= 0 ? "text-success" : "text-destructive"}`}
          >
            GHS {variance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget items table */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Budget Categories</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No budget items yet. Add one to start planning.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Planned</th>
                  <th className="pb-3 font-medium text-right">Actual</th>
                  <th className="pb-3 font-medium text-right">Variance</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => {
                  const v = b.planned_amount - b.spent;
                  const pct =
                    b.planned_amount > 0
                      ? (b.spent / b.planned_amount) * 100
                      : 0;
                  const statusLabel =
                    pct > 100
                      ? "Exceeded"
                      : pct > 75
                        ? "Near Limit"
                        : "On Track";
                  const statusColor =
                    pct > 100
                      ? "text-destructive"
                      : pct > 75
                        ? "text-warning"
                        : "text-success";
                  const barColor =
                    pct > 100
                      ? "bg-destructive"
                      : pct > 75
                        ? "bg-warning"
                        : "bg-primary";
                  return (
                    <tr
                      key={b.id}
                      onClick={() => handleRowClick(b)}
                      className="border-b last:border-0 cursor-pointer transition-colors duration-150 hover:bg-muted/50"
                    >
                      <td className="py-3 font-medium">
                        <div>{b.category_name}</div>
                      </td>
                      <td className="py-3 text-right">
                        GHS {b.planned_amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        GHS {b.spent.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${v >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {v >= 0 ? "+" : ""}GHS {v.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="ml-auto flex flex-col items-end gap-1 w-32">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barColor}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-medium ${statusColor}`}
                          >
                            {statusLabel} · {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={(e) => handleEdit(b, e)}
                            className="rounded-md p-1.5 hover:bg-muted transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // deleteBudgetItem(b.id);
                            }}
                            className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent expenses for this budget */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Recent Expenses</h3>
        {budgetExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses recorded for this budget.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Notes</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {budgetExpenses.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {e.category_name}
                      </span>
                    </td>
                    <td className="py-3">{e.notes}</td>
                    <td className="py-3 text-right font-medium">
                      GHS {Number(e.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetDetail;
