import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Calendar,
  ArrowRight,
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
  useExpenses,
  useCreateBudget,
  useSelectedBudget,
  useProjects,
} from "@/hooks/use-budgets";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const emptyForm = {
  name: "",
  project: "",
  year: currentYear.toString(),
  description: "",
};

const Budgets = () => {
  const navigate = useNavigate();
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    error: budgetsError,
    refetch: fetchBudgets,
  } = useBudgets();
  const { data: expenses = [] } = useExpenses();
  const { setSelectedBudgetId } = useSelectedBudget();
  const createBudgetMutation = useCreateBudget();
  const { data: projects = [] } = useProjects();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);

  const loading = budgetsLoading;
  const error = budgetsError ? "Failed to fetch budgets" : null;
  const budgetItems: any[] = []; // We'll need another hook for all items if needed, or derived

  const filtered =
    filterYear === "all"
      ? budgets
      : budgets.filter((b: any) => b.year === Number(filterYear));

  const handleSave = async () => {
    if (!form.name || !form.project) return;
    setIsSaving(true);
    try {
      const data = {
        name: form.name,
        project: form.project,
        year: Number(form.year),
        description: form.description,
      };
      if (editBudget) {
        // Redacted for now as updateBudgetAPI isn't in services.tsx yet
      } else {
        await createBudgetMutation.mutateAsync(data);
      }
      resetDialog();
    } catch (err: any) {
      console.error("Failed to save budget:", err);
      toast.error(err?.response?.data?.message || "Failed to save budget.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (budget: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditBudget(budget);
    setForm({
      name: budget.name,
      project: budget.project,
      year: budget.year.toString(),
      description: budget.description,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBudgetToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    // Placeholder for delete mutation
    setDeleteConfirmOpen(false);
    setBudgetToDelete(null);
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setEditBudget(null);
    setForm(emptyForm);
  };

  const handleCardClick = (budget: any) => {
    setSelectedBudgetId(budget.id.toString());
    navigate(`/budgets/${budget.id}`);
  };



  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Fetching your budgets...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Create and manage project budgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchBudgets()}>
            Refresh
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) resetDialog();
              else setDialogOpen(true);
            }}
          >
            <DialogTrigger asChild>
              <Button id="create-budget-btn">
                <Plus className="mr-2 h-4 w-4" /> New Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editBudget ? "Edit" : "Create"} Budget
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Budget Name</Label>
                  <Input
                    id="budget-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. 2026 Maize Season"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Project</Label>
                    <Select
                      value={form.project}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, project: v }))
                      }
                    >
                      <SelectTrigger id="budget-project">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((p: any) => (
                          <SelectItem
                            key={p.id || p.project_id}
                            value={(p.id || p.project_id).toString()}
                          >
                            {p.name || p.title || p.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select
                      value={form.year}
                      onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}
                    >
                      <SelectTrigger id="budget-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    id="budget-description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Brief description of this budget"
                  />
                </div>
                <Button
                  id="save-budget-btn"
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : editBudget ? "Update" : "Create"}{" "}
                  Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchBudgets()}
            className="h-8 hover:bg-destructive/20 text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Year filter */}
      <div className="flex items-center gap-3">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-36" id="budget-year-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} budget{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Budget cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-semibold text-muted-foreground">
            No budgets yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Create your first budget to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((budget) => {
            const spent = budget.spent || 0;
            const planned = budget.planned || 0;
            const remaining = budget.left || 0;
            const pct = planned > 0 ? (spent / planned) * 100 : 0;

            return (
              <div
                key={budget.id}
                onClick={() => handleCardClick(budget)}
                className="group relative rounded-xl border bg-card p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">
                      {budget.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {budget.project}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {budget.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(budget, e)}
                      className="rounded-md p-1.5 hover:bg-muted transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(budget.id, e)}
                      className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>

                {budget.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {budget.description}
                  </p>
                )}

                {/* Financials */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Planned
                    </p>
                    <p className="text-sm font-bold">
                      GHS {planned.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Spent
                    </p>
                    <p className="text-sm font-bold text-warning">
                      {spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Left
                    </p>
                    <p
                      className={`text-sm font-bold ${remaining >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 100
                          ? "bg-destructive"
                          : pct > 80
                            ? "bg-warning"
                            : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {pct.toFixed(0)}% used
                  </p>
                </div>

                {/* Click hint */}
                <div className="flex items-center justify-end mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View breakdown <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this budget and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Budgets;
