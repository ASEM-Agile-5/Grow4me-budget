import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  useBudgets,
  useRevenues,
  useSelectedBudget,
  useCreateSale,
  useBudgetDetails,
} from "@/hooks/use-budgets";

const RevenuePage = () => {
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    error: budgetsError,
    refetch: refetchBudgets,
  } = useBudgets();
  const { data: revenues = [], isLoading: revenuesLoading } = useRevenues();
  const { selectedBudgetId } = useSelectedBudget();
  const createSaleMutation = useCreateSale();

  const selectedBudget = useMemo(
    () =>
      budgets.find(
        (b: any) => b.id?.toString() === selectedBudgetId?.toString(),
      ),
    [budgets, selectedBudgetId],
  );

  const loading = budgetsLoading || revenuesLoading;
  const error = budgetsError ? "Failed to load revenue data" : null;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    budgetId: selectedBudgetId?.toString() ?? "",
    product: "",
    quantity: "",
    price_per_unit: "",
    date: "",
    payment_status: "paid" as "paid" | "pending",
    buyer: "",
  });

  const [filterBudget, setFilterBudget] = useState<string>("all");

  const filtered =
    filterBudget === "all"
      ? revenues
      : revenues.filter((r: any) => r.budget_name === filterBudget);
  const totalRevenue = filtered.reduce(
    (s: number, r: any) => s + Number(r.total_amount),
    0,
  );
  const totalPaid = filtered
    .filter((r: any) => r.payment_status === "paid")
    .reduce((s: number, r: any) => s + Number(r.total_amount), 0);
  const totalPending = filtered
    .filter((r: any) => r.payment_status === "pending")
    .reduce((s: number, r: any) => s + Number(r.total_amount), 0);

  const handleSave = async () => {
    if (!form.quantity || !form.price_per_unit || !form.date) {
      console.error("Validation failed: missing fields", {
        qty: form.quantity,
        price: form.price_per_unit,
        date: form.date,
      });
      alert("Please fill in the Quantity, Price/Unit, and Date.");
      return;
    }

    try {
      console.log("Calling createSaleMutation with payload:", {
        budget: form.budgetId,
        product: form.product,
        quantity: Number(form.quantity),
        price_per_unit: Number(form.price_per_unit),
        date: form.date,
        buyer: form.buyer,
        payment_status: form.payment_status,
      });
      await createSaleMutation.mutateAsync({
        budget: form.budgetId,
        product: form.product,
        quantity: Number(form.quantity),
        price_per_unit: Number(form.price_per_unit),
        date: form.date,
        buyer: form.buyer, // Send empty string if optional
        payment_status: form.payment_status,
      });
      setForm({
        budgetId: selectedBudgetId?.toString() ?? "",
        product: "",
        quantity: "",
        price_per_unit: "",
        date: "",
        payment_status: "paid",
        buyer: "",
      });
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to save revenue:", err);
      toast.error(err?.response?.data?.message || "Failed to save revenue. Please check your inputs.");
    }
  };

  const deleteRevenue = (id: string) => {
    // Placeholder
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Loading revenue data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
          <p className="text-muted-foreground">Track farm income and sales</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button id="record-sale-btn">
                <Plus className="mr-2 h-4 w-4" /> Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Budget</Label>
                  <Select
                    value={form.budgetId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, budgetId: v }))
                    }
                  >
                    <SelectTrigger id="revenue-budget">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product</Label>
                  <Input
                    id="revenue-product"
                    placeholder="Enter product name"
                    value={form.product}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Price/Unit (GHS)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.price_per_unit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price_per_unit: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                {form.quantity && form.price_per_unit && (
                  <p className="text-sm font-medium">
                    Total:{" "}
                    <span className="text-primary">
                      GHS{" "}
                      {(
                        Number(form.quantity) * Number(form.price_per_unit)
                      ).toLocaleString()}
                    </span>
                  </p>
                )}
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Buyer (optional)</Label>
                  <Input
                    value={form.buyer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, buyer: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <Select
                    value={form.payment_status}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        payment_status: v as "paid" | "pending",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  id="save-revenue-btn"
                  className="w-full"
                  onClick={handleSave}
                >
                  Save Sale
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

      {/* Budget filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterBudget} onValueChange={setFilterBudget}>
          <SelectTrigger className="w-48" id="revenue-filter-budget">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            {budgets.map((b) => (
              <SelectItem key={b.id} value={b.name}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">
            GHS {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Received</p>
          <p className="text-xl font-bold text-success">
            GHS {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-xl font-bold text-warning">
            GHS {totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Budget</th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Qty</th>
                <th className="pb-3 font-medium text-right">Price/Unit</th>
                <th className="pb-3 font-medium text-right">Total</th>
                <th className="pb-3 font-medium text-center">Buyer</th>
                <th className="pb-3 font-medium text-right">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No revenue records found
                  </td>
                </tr>
              ) : (
                filtered.map((r: any) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {r.budget_name}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{r.product}</td>
                    <td className="py-3">{r.quantity}</td>
                    <td className="py-3 text-right">
                      GHS {Number(r.price_per_unit).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      GHS {Number(r.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 text-center  text-muted-foreground">
                      {r.buyer || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          r.payment_status === "paid" ? "default" : "secondary"
                        }
                        className={
                          r.payment_status === "paid"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {r.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteRevenue(r.id)}
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

export default RevenuePage;
