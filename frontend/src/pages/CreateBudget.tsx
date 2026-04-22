import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  History,
  MessageSquareText,
  Eye,
  Loader2,
  List,
  AlignLeft,
  LayoutGrid,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import BudgetPreviewModal, {
  type PreviewBudgetItem,
} from "@/components/BudgetPreviewModal";
import {
  useProjects,
  useCreateBudget,
  useBulkCreateBudgetItems,
  useAITranslateBudget,
  useBudgetCategories,
  useBudgetTemplates,
  useBudgets,
} from "@/hooks/use-budgets";
import { getBudgetDetailsAPI } from "@/services/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const CreateBudget = () => {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useBudgetCategories();
  const { data: templates = [], isLoading: templatesLoading } = useBudgetTemplates();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const createBudgetMutation = useCreateBudget();
  const bulkCreateItemsMutation = useBulkCreateBudgetItems();
  const aiTranslateMutation = useAITranslateBudget();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewBudgetItem[]>([]);
  const [previewIcon, setPreviewIcon] = useState("📋");
  const [textInput, setTextInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [fetchingHistorical, setFetchingHistorical] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [projectSearchOpen, setProjectSearchOpen] = useState(false);

  // Budget Metadata
  const [budgetName, setBudgetName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [description, setDescription] = useState("");

  const openPreview = (
    title: string,
    description: string,
    items: PreviewBudgetItem[],
    icon: string = "📋",
  ) => {
    setPreviewTitle(title);
    setPreviewDescription(description);
    setPreviewItems(items);
    setPreviewIcon(icon);
    setPreviewOpen(true);
  };

  const validateMetadata = () => {
    if (!budgetName.trim() || !selectedProject) {
      toast.error("Please fill in Budget Name and select a Project before continuing.");
      setShowValidationAlert(true);
      return false;
    }
    return true;
  };

  // --- Template ---
  const handleSelectTemplate = (templateId: string) => {
    if (!validateMetadata()) return;
    const template = templates.find((t: any) => t.id === templateId);
    if (!template) return;
    const items: PreviewBudgetItem[] = template.budget_items.map((it, i) => {
      const cat = categories.find((c: any) => c.id === it.category);
      const catId = cat?.id || it.category;
      const catName = cat?.category_name || it.category_name || "Unknown";
      return {
        id: `tpl-${i}`,
        category: catId,
        category_id: catId,
        category_name: catName,
        planned_amount: it.planned_amount,
        description: it.description || "",
        inventory: it.inventory,
        quantity: it.quantity,
        units: it.units,
      };
    });
    openPreview(
      `New Budget from: ${template.name}`,
      template.description,
      items,
      template.icon,
    );
  };

  const handleSelectAllTemplates = () => {
    if (!validateMetadata()) return;
    const allItems: PreviewBudgetItem[] = [];
    templates.forEach((template: any) => {
      template.budget_items.forEach((it) => {
        const cat = categories.find((c: any) => c.id === it.category);
        const catId = cat?.id || it.category;
        const catName = cat?.category_name || it.category_name || "Unknown";
        allItems.push({
          id: `all-${allItems.length}`,
          category: catId,
          category_id: catId,
          category_name: catName,
          planned_amount: it.planned_amount,
          description: it.description || `From ${template.name} template`,
          inventory: it.inventory,
          quantity: it.quantity,
          units: it.units,
        });
      });
    });

    openPreview(
      "All Templates Combined",
      "Showing all available line items from all farm templates",
      allItems,
    );
  };

  // --- Historical ---
  const handleSelectHistorical = async (budgetId: string) => {
    if (!validateMetadata()) return;
    const budget = budgets.find((b: any) => b.id === budgetId);
    if (!budget) return;

    setFetchingHistorical(true);
    try {
      const details = await getBudgetDetailsAPI(budgetId);
      const budgetItems = details.budget_items || [];

      const items: PreviewBudgetItem[] = budgetItems.map((b: any) => {
        // Try to find the category locally to get the display name
        const cat = categories.find(
          (c: any) => c.category_name === b.category_name,
        );
        const catId = cat?.id || b.category;
        
        return {
          id: `hist-${b.id}`,
          category: catId,
          category_id: catId,
          category_name: b.category_name || "Unknown",
          planned_amount: parseFloat(b.planned_amount) || 0,
          description: b.description || `Historical data from ${budget.name}`,
          inventory: b.inventory || false,
          quantity: b.quantity || 0,
          units: b.units || "",
        };
      });

      openPreview(
        `New Budget from: ${budget.name}`,
        `Based on your previously created budget for ${budget.project} (${budget.year})`,
        items,
        "📋",
      );
    } catch (error) {
      toast.error("Failed to fetch historical budget details.");
      console.error(error);
    } finally {
      setFetchingHistorical(false);
    }
  };

  // --- Text parse ---
  const handleParseText = async () => {
    if (!validateMetadata()) return;
    if (!textInput.trim()) {
      toast.error("Please enter your budget items");
      return;
    }
    setParsing(true);

    try {
      const response = await aiTranslateMutation.mutateAsync({
        text: textInput,
      });
      const parsed: PreviewBudgetItem[] = response.map(
        (item: any, i: number) => ({
          id: `ai-${i}`,
          budget: null,
          category: item.category_id,
          category_id: item.category_id,
          category_name: item.category_name,
          planned_amount: parseFloat(item.planned_amount) || 0,
          spent: 0,
          description: item.description || "",
        }),
      );

      openPreview(
        "AI Budget Extract",
        `${parsed.length} items extracted by AI from your description`,
        parsed,
      );
    } catch (error: any) {
      const errType = error?.response?.data?.type;
      const errMsg = error?.response?.data?.error || "";
      if (errType === "ResourceExhausted" || errMsg.includes("429") || errMsg.toLowerCase().includes("quota")) {
        toast.error("You have reached your Gemini quota. Please check your plan and billing details at aistudio.google.com.");
      } else {
        toast.error("Failed to parse budget text. Please try again.");
      }
      console.error(error);
    } finally {
      setParsing(false);
    }
  };

  // --- Confirm ---
  const handleConfirm = async (items: PreviewBudgetItem[]) => {
    if (!budgetName || !selectedProject || !selectedYear) {
      toast.error(
        "Please fill in the Budget Name, Project, and Year above first.",
      );
      return;
    }

    setIsConfirming(true);
    try {
      // Combine budget metadata and items into a single payload
      const payload = {
        create: true,
        name: budgetName,
        project: selectedProject,
        year: Number(selectedYear),
        description: description,
        icon: previewIcon,
        budget_items: items.map((item) => ({
          budget: null, // As requested in the platform-style payload
          category: item.category_id || item.category,
          planned_amount: item.planned_amount,
          inventory: item.inventory,
          quantity: item.quantity,
          units: item.units,
        })),
      };

      await bulkCreateItemsMutation.mutateAsync(payload);

      toast.success(`Budget successfully created with ${items.length} items!`);
      navigate("/budgets");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create budget. Please try again.",
      );
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/budgets")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Budget</h1>
          <p className="text-muted-foreground">
            Choose a method to start your budget
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Budget Name</Label>
              <Input
                placeholder="e.g. 2026 Maize Season"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Project</Label>
              <Popover
                open={projectSearchOpen}
                onOpenChange={setProjectSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={projectSearchOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedProject
                      ? projects.find(
                          (p: any) => p.id.toString() === selectedProject,
                        )?.name ||
                        projects.find(
                          (p: any) => p.id.toString() === selectedProject,
                        )?.title ||
                        projects.find(
                          (p: any) => p.id.toString() === selectedProject,
                        )?.projectName ||
                        "Select project"
                      : "Select project"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search projects..." />
                    <CommandList>
                      <CommandEmpty>No project found.</CommandEmpty>
                      <CommandGroup>
                        {projects.map((p: any) => {
                          const pId = (p.id || p.project_id).toString();
                          const pName = p.name || p.title || p.projectName;
                          return (
                            <CommandItem
                              key={pId}
                              value={pName}
                              onSelect={() => {
                                setSelectedProject(pId);
                                setProjectSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProject === pId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {pName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
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
          <div className="mt-4 space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              placeholder="Brief description of this budget"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Historical
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" /> Text Import
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select a predefined template to get started quickly. You can
              customize it before confirming.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllTemplates}
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Preview All Templates
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templatesLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading budget templates...
                </p>
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full text-center py-12 rounded-xl border border-dashed text-muted-foreground text-sm">
                No budget templates available.
              </div>
            ) : (
              templates.map((template: any) => (
                <div
                  key={template.id}
                  className="group rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.budget_items.slice(0, 3).map((item: any, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {item.category_name}
                        </span>
                      ))}
                      {template.budget_items.length > 3 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          +{template.budget_items.length - 3}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      GHS{" "}
                      {template.budget_items
                        .reduce((s: number, i: any) => s + i.planned_amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" /> Preview & Edit
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Historical Tab */}
        <TabsContent value="historical" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgetsLoading || fetchingHistorical ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {budgetsLoading
                    ? "Loading previous budgets..."
                    : "Fetching budget details..."}
                </p>
              </div>
            ) : budgets.length === 0 ? (
              <div className="col-span-full text-center py-12 rounded-xl border border-dashed text-muted-foreground text-sm">
                No historical budgets found to use as a basis.
              </div>
            ) : (
              budgets.map((budget: any) => (
                <div
                  key={budget.id}
                  className="group rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleSelectHistorical(budget.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <History className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {budget.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {budget.project} • {budget.year}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Season Total
                      </p>
                      <p className="text-sm font-bold text-primary">
                        GHS {budget.planned?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Use as Basis <ArrowLeft className="ml-2 h-3.5 w-3.5 rotate-180" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Text Import Tab */}
        <TabsContent value="text" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Describe your budget in your own words, listing items and their
            costs naturally.
          </p>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <Label>Describe your budget</Label>
              <Textarea
                className="mt-2 min-h-[200px] text-sm"
                placeholder="Type a list of budget items or describe your budget in your own words or Describe a project i.e. I need seeds for 3000, fertilizer costing 4000, labor at 3500, transport for 2000, and pesticides worth 1200. I also need equipment."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Describe naturally, e.g.{" "}
                <code className="bg-muted px-1 rounded">seeds for 3000</code> or{" "}
                <code className="bg-muted px-1 rounded">
                  5000 on fertilizer
                </code>
              </p>
            </div>
            <Button
              onClick={handleParseText}
              disabled={parsing || !textInput.trim()}
            >
              {parsing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {parsing ? "Parsing..." : "Preview Budget"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <BudgetPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        description={previewDescription}
        items={previewItems}
        onConfirm={handleConfirm}
        loading={isConfirming}
      />

      <AlertDialog
        open={showValidationAlert}
        onOpenChange={setShowValidationAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Budget Information</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a <strong>Budget Name</strong> and select a{" "}
              <strong>Project</strong> before proceeding with templates or
              imports. This information is required to establish the context for
              your new budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidationAlert(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateBudget;
