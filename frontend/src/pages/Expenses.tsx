import { useState, useMemo } from "react";
import { Plus, Trash2, Package, CircleAlert } from "lucide-react";
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
import { expenseCategories } from "@/lib/mock-data";

import {
  useBudgets,
  useExpenses,
  useCreateExpense,
  useBudgetDetails,
} from "@/hooks/use-budgets";

const Expenses = () => {
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    refetch: refetchBudgets,
  } = useBudgets();
  const {
    data: expenses = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useExpenses();
  const createExpenseMutation = useCreateExpense();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterBudget, setFilterBudget] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    budgetId: "",
    budgetItemId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    quantity: "",
  });

  // Fetch details for the budget selected in the ADD FORM to populate "Budget Item / Category"
  const { data: selectedFormBudgetDetails } = useBudgetDetails(
    form.budgetId || null,
  );
  const availableItems = useMemo(() => {
    if (!selectedFormBudgetDetails?.budget_items) return [];
    return selectedFormBudgetDetails.budget_items.map((it: any) => ({
      id: it.id,
      category: it.category_name,
      trackInventory: true, // API details might vary, assuming true for now
    }));
  }, [selectedFormBudgetDetails]);

  // For the pages overall category filter, we'll derive from expenses list
  const allUsedCategories = useMemo(() => {
    const cats = new Set(expenses.map((e: any) => e.category_name));
    return Array.from(cats).sort();
  }, [expenses]);

  const allUsedYears = useMemo(() => {
    const years = new Set(
      expenses.map((e: any) => new Date(e.date).getFullYear()),
    );
    return Array.from(years).sort((a: any, b: any) => b - a);
  }, [expenses]);

  const loading = budgetsLoading || expensesLoading;
  const error = expensesError ? "Failed to load expenses" : null;

  const filtered = expenses.filter((e: any) => {
    if (filterCat !== "all" && e.category_name !== filterCat) return false;
    if (
      filterBudget !== "all" &&
      e.budget.toString() !== filterBudget.toString() &&
      e.budget_name !== filterBudget
    )
      return false;
    if (
      filterYear !== "all" &&
      new Date(e.date).getFullYear().toString() !== filterYear.toString()
    )
      return false;
    return true;
  });

  const totalFiltered = filtered.reduce(
    (s: number, e: any) => s + (Number(e.amount) || 0),
    0,
  );

  const getBudgetName = (budgetId: string | number) =>
    budgets.find((b: any) => b.id.toString() === budgetId.toString())?.name ??
    "Unknown";

  const matchedInventoryItem = availableItems.find(
    (bi: any) =>
      bi.id?.toString() === form.budgetItemId?.toString() && bi.trackInventory,
  );

  const handleSave = async () => {
    if (!form.budgetId || !form.budgetItemId || !form.amount || !form.date)
      return;
    setIsSaving(true);
    try {
      await createExpenseMutation.mutateAsync({
        budget_item: form.budgetItemId,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes,
        quantity:
          matchedInventoryItem && form.quantity
            ? Number(form.quantity)
            : undefined,
      });
      setForm({
        budgetId: "",
        budgetItemId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        quantity: "",
      });
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save expense:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExpense = (id: string) => {
    // Placeholder
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Fetching expenses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track daily farm spending</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button id="add-expense-btn">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Budget</Label>
                  <Select
                    value={form.budgetId}
                    onValueChange={(v) => {
                      setForm((f) => ({ ...f, budgetId: v, budgetItemId: "" }));
                    }}
                  >
                    <SelectTrigger id="expense-budget">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget Item / Category</Label>
                  <Select
                    value={form.budgetItemId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, budgetItemId: v }))
                    }
                    disabled={!form.budgetId}
                  >
                    <SelectTrigger id="expense-category">
                      <SelectValue
                        placeholder={
                          form.budgetId
                            ? "Select item"
                            : "Select a budget first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (GHS)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    id="expense-notes"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Optional notes"
                  />
                </div>

                {/* Inventory quantity — shown when expense matches an inventory-tracked budget item */}
                {matchedInventoryItem && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Adding stock to: {matchedInventoryItem.category}
                    </div>
                    <div>
                      <Label>Quantity Purchased</Label>
                      <Input
                        id="expense-inventory-qty"
                        type="number"
                        min={0}
                        value={form.quantity}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            quantity: e.target.value,
                          }))
                        }
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>
                )}

                <Button
                  id="save-expense-btn"
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Filters and total */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterBudget} onValueChange={setFilterBudget}>
          <SelectTrigger className="w-48" id="filter-budget">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            {budgets.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44" id="filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allUsedCategories.map((c: any) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-32" id="filter-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {allUsedYears.map((y: any) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm">
          Total:{" "}
          <span className="font-bold">
            GHS {totalFiltered.toLocaleString()}
          </span>
          <span className="text-muted-foreground ml-1">
            ({filtered.length} items)
          </span>
        </div>
      </div>

      {/* Expense list */}
      <div className="rounded-xl border bg-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Budget</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Notes</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No expenses found
                  </td>
                </tr>
              ) : (
                filtered.map((e: any) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {e.budget_name}
                      </span>
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
                    <td className="py-3 text-right text-muted-foreground">
                      {e.quantity ? e.quantity : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
