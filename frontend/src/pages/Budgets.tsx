import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Calendar,
  ArrowRight,
  FileText,
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
import { useUser } from "@/contexts/UserContext";
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
  const { user } = useUser();
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
              <Button id="create-budget-btn" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> New Budget
              </Button>
            </DialogTrigger>
            <Button onClick={() => navigate("/budgets/create")}>
              <FileText className="mr-2 h-4 w-4" /> Templates
            </Button>
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
                className="group relative rounded-2xl border bg-card/40 backdrop-blur-md p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:bg-card/60 hover:border-primary/30 hover:-translate-y-1 border-white/5 stat-card-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg leading-tight tracking-tight truncate">
                      {budget.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest">
                        {budget.project}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        {budget.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(budget, e)}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {user?.role === "ADMIN" && (
                      <button
                        onClick={(e) => handleDelete(budget.id, e)}
                        className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>

                {budget.description && (
                  <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed">
                    {budget.description}
                  </p>
                )}

                {/* Financials - Simplified */}
                <div className="flex items-end justify-between mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                      Spent / Planned
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-foreground">
                        GHS {spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        of GHS {planned.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                      Remaining
                    </p>
                    <p className={`text-sm font-bold ${remaining >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                     {remaining >= 0 ? "+" : ""}GHS {remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress bar - Ultra thin */}
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        pct > 100
                          ? "bg-destructive"
                          : pct > 80
                            ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            : "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={pct > 100 ? "text-destructive" : pct > 80 ? "text-amber-500" : "text-primary"}>
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground/40 font-medium">UTILIZATION</span>
                  </div>
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
              This action cannot be undone. This will permanently delete this
              budget and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Budgets;
