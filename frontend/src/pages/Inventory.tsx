import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  SlidersHorizontal,
  History,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  useBudgets,
  useInventory,
  useInventoryHistory,
  useAdjustInventory,
  useSetInventoryMin,
} from "@/hooks/use-budgets";

const Inventory = () => {
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    refetch: refetchBudgets,
  } = useBudgets();
  const {
    data: inventory = [],
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useInventory();
  const {
    data: inventoryHistory = [],
    isLoading: historyLoading,
  } = useInventoryHistory();
  const adjustStockMutation = useAdjustInventory();
  const setMinimumMutation = useSetInventoryMin();

  const [filterBudget, setFilterBudget] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "out">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Stock adjustment dialog
  const [adjustItem, setAdjustItem] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<
    "added" | "reduced" | "adjustment"
  >("added");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [confirmAdjustOpen, setConfirmAdjustOpen] = useState(false);

  // History dialog
  const [historyItem, setHistoryItem] = useState<any | null>(null);

  // Min stock edit
  const [editMinItem, setEditMinItem] = useState<any | null>(null);
  const [editMinValue, setEditMinValue] = useState("");

  const getBudgetName = (budgetId: string | number) =>
    budgets.find((b: any) => b.id.toString() === budgetId.toString())?.name ??
    "Unknown";

  const getStatus = (inv: any) => {
    if (inv.current_stock === 0)
      return {
        label: "Out of Stock",
        color: "text-destructive",
        bg: "bg-destructive/10",
      };
    if (inv.current_stock < inv.minimum_stock)
      return { label: "Low Stock", color: "text-warning", bg: "bg-warning/10" };
    return { label: "In Stock", color: "text-success", bg: "bg-success/10" };
  };

  const filtered = useMemo(() => {
    return inventory.filter((inv: any) => {
      if (
        filterBudget !== "all" &&
        inv.budget_id?.toString() !== filterBudget.toString()
      )
        return false;
      if (filterStatus === "low" && inv.current_stock >= inv.minimum_stock)
        return false;
      if (filterStatus === "out" && inv.current_stock > 0) return false;
      if (
        searchTerm &&
        !inv.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [inventory, filterBudget, filterStatus, searchTerm]);

  const handleReviewAdjust = () => {
    if (!adjustItem || !adjustQty || Number(adjustQty) <= 0) return;
    if (!adjustNotes.trim()) {
      toast.error("Please add a reason for the adjustment.");
      return;
    }
    setConfirmAdjustOpen(true);
  };

  const handleAdjust = async () => {
    setConfirmAdjustOpen(false);
    setIsUpdating(true);
    try {
      await adjustStockMutation.mutateAsync({
        budget_item: adjustItem.budget_item_id,
        action: adjustType === "added" ? "add_stock" : "remove_stock",
        quantity: Number(adjustQty),
        notes: adjustNotes,
      });
      setAdjustItem(null);
      setAdjustQty("");
      setAdjustNotes("");
      setAdjustType("added");
    } catch (err: any) {
      console.error("Failed to adjust stock:", err);
      toast.error(err?.response?.data?.message || "Failed to adjust stock. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMinStockSave = async () => {
    if (!editMinItem) return;
    setIsUpdating(true);
    try {
      await setMinimumMutation.mutateAsync({
        inventory_item: editMinItem.id,
        minimum_stock: Number(editMinValue) || 0,
      });
      setEditMinItem(null);
      setEditMinValue("");
    } catch (err: any) {
      console.error("Failed to update min stock:", err);
      toast.error(err?.response?.data?.message || "Failed to update min stock level.");
    } finally {
      setIsUpdating(false);
    }
  };

  const loading = budgetsLoading || inventoryLoading || historyLoading;
  const error = inventoryError ? "Failed to load inventory" : null;

  const lowStockCount = useMemo(
    () =>
      inventory.filter((inv: any) => inv.current_stock < inv.minimum_stock)
        .length,
    [inventory],
  );

  const totalItems = inventory.length;
  const outOfStockCount = useMemo(
    () => inventory.filter((inv: any) => inv.current_stock === 0).length,
    [inventory],
  );

  const itemLogs: any[] = []; // Placeholder or derived from item history if available

  if (loading && inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Loading inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage farm stock levels
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Total Items</p>
          </div>
          <p className="text-xl font-bold mt-1">{totalItems}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              Total Units in Stock
            </p>
          </div>
          <p className="text-xl font-bold mt-1">
            {inventory
              .reduce((s: number, inv: any) => s + (inv.current_stock || 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
          </div>
          <p className="text-xl font-bold text-warning mt-1">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-destructive" />
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </div>
          <p className="text-xl font-bold text-destructive mt-1">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="inventory-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="pl-9 w-56"
          />
        </div>
        <Select value={filterBudget} onValueChange={setFilterBudget}>
          <SelectTrigger className="w-48" id="inventory-filter-budget">
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
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="w-40" id="inventory-filter-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Inventory table */}
      <div className="rounded-xl border bg-card p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">
              No inventory items
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add budget items with "Track Inventory" enabled to populate this
              page
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Current Stock</th>
                  <th className="pb-3 font-medium text-right">Min Stock</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const status = getStatus(inv);
                  return (
                    <tr
                      key={inv.id}
                      className={`border-b last:border-0 transition-colors duration-150 hover:bg-muted/50 ${
                        inv.current_stock < inv.minimum_stock
                          ? "bg-warning/5"
                          : ""
                      }`}
                    >
                      <td className="py-3 font-medium">{inv.item_name}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {getBudgetName(inv.budget_id)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {inv.category_name}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {inv.current_stock}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          {inv.unit}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {inv.minimum_stock} {inv.unit}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.color} ${status.bg}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustItem(inv);
                              setAdjustType("added");
                            }}
                            className="rounded-md p-1.5 hover:bg-primary/10 transition-colors"
                            title="Add stock"
                          >
                            <Plus className="h-3.5 w-3.5 text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustItem(inv);
                              setAdjustType("reduced");
                            }}
                            className="rounded-md p-1.5 hover:bg-warning/10 transition-colors"
                            title="Reduce stock"
                          >
                            <Minus className="h-3.5 w-3.5 text-warning" />
                          </button>
                          <button
                            onClick={() => {
                              setEditMinItem(inv);
                              setEditMinValue(inv.minimumStock.toString());
                            }}
                            className="rounded-md p-1.5 hover:bg-muted transition-colors"
                            title="Set minimum stock"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setHistoryItem(inv)}
                            className="rounded-md p-1.5 hover:bg-muted transition-colors"
                            title="View history"
                          >
                            <History className="h-3.5 w-3.5 text-muted-foreground" />
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

      {/* Recent Inventory History */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Inventory History</h3>
        {inventoryHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No history recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Notes</th>
                  <th className="pb-3 font-medium text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {inventoryHistory.map((h: any) => {
                  const isAdd = h.action === "add_stock";
                  const isReduce = h.action === "remove_stock";
                  return (
                    <tr key={h.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {h.budget_item_name}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`rounded-full p-1 ${
                              isAdd
                                ? "bg-success/10 text-success"
                                : isReduce
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isAdd ? (
                              <Plus className="h-3 w-3" />
                            ) : isReduce ? (
                              <Minus className="h-3 w-3" />
                            ) : (
                              <SlidersHorizontal className="h-3 w-3" />
                            )}
                          </div>
                          <span className="capitalize text-xs font-medium">
                            {h.action.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {h.user?.name || "System"}
                      </td>
                      <td className="py-3 text-muted-foreground">{h.notes || "—"}</td>
                      <td className={`py-3 text-right font-medium ${isAdd ? "text-success" : isReduce ? "text-destructive" : ""}`}>
                        {isAdd ? "+" : isReduce ? "-" : ""}{h.quantity}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={!!adjustItem}
        onOpenChange={(open) => {
          if (!open) {
            setAdjustItem(null);
            setAdjustQty("");
            setAdjustNotes("");
          }
        }}
      >
        <DialogContent>
          {adjustItem && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {adjustType === "added"
                    ? "Add Stock"
                    : adjustType === "reduced"
                      ? "Reduce Stock"
                      : "Adjust Stock"}{" "}
                  — {adjustItem.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p>
                    Current stock:{" "}
                    <span className="font-bold">
                      {adjustItem.currentStock} {adjustItem.unit}
                    </span>
                  </p>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select
                    value={adjustType}
                    onValueChange={(v) => setAdjustType(v as any)}
                  >
                    <SelectTrigger id="adjust-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="added">Add stock</SelectItem>
                      <SelectItem value="reduced">Reduce stock</SelectItem>
                      <SelectItem value="adjustment">
                        Set exact quantity
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {adjustType === "adjustment"
                      ? "New Stock Level"
                      : "Quantity"}{" "}
                    ({adjustItem.unit})
                  </Label>
                  <Input
                    id="adjust-qty"
                    type="number"
                    min={0}
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Notes <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="adjust-notes"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="Reason for adjustment..."
                    rows={2}
                  />
                </div>
                <Button className="w-full" onClick={handleReviewAdjust}>
                  {adjustType === "added"
                    ? "Add to Stock"
                    : adjustType === "reduced"
                      ? "Remove from Stock"
                      : "Set Stock"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Min Stock Edit Dialog */}
      <Dialog
        open={!!editMinItem}
        onOpenChange={(open) => {
          if (!open) setEditMinItem(null);
        }}
      >
        <DialogContent>
          {editMinItem && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Set Minimum Stock — {editMinItem.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  You'll receive a low stock alert when this item drops below
                  the minimum.
                </p>
                <div>
                  <Label>Minimum Stock ({editMinItem.unit})</Label>
                  <Input
                    id="min-stock-value"
                    type="number"
                    min={0}
                    value={editMinValue}
                    onChange={(e) => setEditMinValue(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <Button className="w-full" onClick={handleMinStockSave}>
                  Save Minimum
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={!!historyItem}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null);
        }}
      >
        <DialogContent>
          {historyItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Stock History — {historyItem.name}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                <div className="rounded-lg bg-muted/50 p-3 mb-4 text-sm">
                  Current stock:{" "}
                  <span className="font-bold">
                    {historyItem.currentStock} {historyItem.unit}
                  </span>
                </div>
                {itemLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No history recorded yet.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {itemLogs.map((log) => {
                      const isAdd = log.type === "added";
                      const isReduce = log.type === "reduced";
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                        >
                          <div
                            className={`mt-0.5 rounded-full p-1 ${
                              isAdd
                                ? "bg-success/10"
                                : isReduce
                                  ? "bg-destructive/10"
                                  : "bg-muted"
                            }`}
                          >
                            {isAdd ? (
                              <Plus className="h-3 w-3 text-success" />
                            ) : isReduce ? (
                              <Minus className="h-3 w-3 text-destructive" />
                            ) : (
                              <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  isAdd
                                    ? "text-success"
                                    : isReduce
                                      ? "text-destructive"
                                      : ""
                                }`}
                              >
                                {isAdd ? "+" : isReduce ? "-" : "="}
                                {log.quantity} {historyItem.unit}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmAdjustOpen} onOpenChange={setConfirmAdjustOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently alter the inventory count for this unit. You will be unable to make changes to the details of this item log afterwards. Are you sure you want to finalize this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdjust}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
