import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { expenseCategories } from "@/lib/mock-data";

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

  useEffect(() => {
    setItems(initialItems);
  }, [open, initialItems]);

  const total = items.reduce((s, i) => s + i.planned_amount, 0);

  const handleAdd = () => {
    if (!newCategory || !newPlanned) return;
    const catId = expenseCategories.indexOf(newCategory).toString(); // Placeholder ID logic
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        category: catId,
        category_id: catId,
        category_name: newCategory,
        planned_amount: Number(newPlanned),
        description: newDescription,
        inventory: false,
        quantity: 0,
        units: "units",
      },
    ]);
    setNewCategory("");
    setNewPlanned("");
    setNewDescription("");
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (id: string, currentValue: number) => {
    setEditingId(id);
    setEditValue(String(currentValue));
  };

  const commitEdit = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, planned_amount: Number(editValue) || 0 } : i,
      ),
    );
    setEditingId(null);
  };

  const handleConfirm = () => {
    onConfirm(items);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Planned Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.category_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        {item.description && (
                          <p className="line-clamp-1 italic">
                            "{item.description}"
                          </p>
                        )}
                        {item.inventory && (
                          <p className="font-medium text-primary/70">
                            Inventory: {item.quantity} {item.units}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24 h-7 text-sm ml-auto text-right"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(item.id)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && commitEdit(item.id)
                          }
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <span className="font-semibold">
                          GHS {item.planned_amount.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            startEdit(item.id, item.planned_amount)
                          }
                          className="rounded-md p-1.5 hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No budget items. Add one below.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Add new item */}
          <div className="flex items-end gap-2 pt-4 px-1">
            <div className="flex-1">
              <Label className="text-xs">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs">Amount</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={newPlanned}
                onChange={(e) => setNewPlanned(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
            <div className="flex-[2]">
              <Label className="text-xs">Notes</Label>
              <Input
                className="h-8 text-sm"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleAdd}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-lg font-bold">GHS {total.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={items.length === 0 || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {loading ? "Creating..." : "Confirm Budget"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetPreviewModal;
