import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  History,
  MessageSquareText,
  Eye,
  LayoutGrid,
  Sprout,
} from "lucide-react";
import { toast } from "sonner";
import BudgetPreviewModal, {
  type PreviewBudgetItem,
} from "@/components/BudgetPreviewModal";
import {
  useProjects,
  useBulkCreateBudgetItems,
  useAITranslateBudget,
  useBudgetCategories,
  useBudgetTemplates,
  useBudgets,
} from "@/hooks/use-budgets";
import { getBudgetDetailsAPI } from "@/services/services";
import { fmtC } from "@/components/gfm/primitives";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const TABS = [
  { key: "templates", label: "Templates", Icon: FileText },
  { key: "historical", label: "Historical", Icon: History },
  { key: "text", label: "Text Import", Icon: MessageSquareText },
];

const CreateBudget = () => {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useBudgetCategories();
  const { data: templates = [], isLoading: templatesLoading } =
    useBudgetTemplates();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const bulkCreateItemsMutation = useBulkCreateBudgetItems();
  const aiTranslateMutation = useAITranslateBudget();

  const [activeTab, setActiveTab] = useState("templates");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewBudgetItem[]>([]);
  const [previewIcon, setPreviewIcon] = useState("📋");
  const [textInput, setTextInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [fetchingHistorical, setFetchingHistorical] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [budgetName, setbudgetName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [description, setDescription] = useState("");

  const openPreview = (
    title: string,
    desc: string,
    items: PreviewBudgetItem[],
    icon = "📋",
  ) => {
    setPreviewTitle(title);
    setPreviewDescription(desc);
    setPreviewItems(items);
    setPreviewIcon(icon);
    setPreviewOpen(true);
  };

  const validateMetadata = () => {
    if (!budgetName.trim() && !selectedProject) {
      setValidationError("Please enter a Budget Name and select a Project before continuing.");
      return false;
    }
    if (!budgetName.trim()) {
      setValidationError("Please enter a Budget Name before continuing.");
      return false;
    }
    if (!selectedProject) {
      setValidationError("Please select a Project before continuing.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSelectTemplate = (templateId: string) => {
    if (!validateMetadata()) return;
    const template = templates.find((t: any) => t.id === templateId);
    if (!template) return;
    const items: PreviewBudgetItem[] = template.budget_items.map(
      (it: any, i: number) => {
        const cat = categories.find((c: any) => c.id === it.category);
        const catId = cat?.id || it.category;
        return {
          id: `tpl-${i}`,
          category: catId,
          category_id: catId,
          category_name: cat?.category_name || it.category_name || "Unknown",
          planned_amount: it.planned_amount,
          description: it.description || "",
          inventory: it.inventory,
          quantity: it.quantity,
          units: it.units,
        };
      },
    );
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
      template.budget_items.forEach((it: any) => {
        const cat = categories.find((c: any) => c.id === it.category);
        const catId = cat?.id || it.category;
        allItems.push({
          id: `all-${allItems.length}`,
          category: catId,
          category_id: catId,
          category_name: cat?.category_name || it.category_name || "Unknown",
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
      "All available line items from every farm template",
      allItems,
    );
  };

  const handleSelectHistorical = async (budgetId: string) => {
    if (!validateMetadata()) return;
    const budget = budgets.find((b: any) => b.id === budgetId);
    if (!budget) return;
    setFetchingHistorical(true);
    try {
      const details = await getBudgetDetailsAPI(budgetId);
      const items: PreviewBudgetItem[] = (details.budget_items || []).map(
        (b: any) => {
          const cat = categories.find(
            (c: any) => c.category_name === b.category_name,
          );
          return {
            id: `hist-${b.id}`,
            category: cat?.id || b.category,
            category_id: cat?.id || b.category,
            category_name: b.category_name || "Unknown",
            planned_amount: parseFloat(b.planned_amount) || 0,
            description: b.description || `Historical data from ${budget.name}`,
            inventory: b.inventory || false,
            quantity: b.quantity || 0,
            units: b.units || "",
          };
        },
      );
      openPreview(
        `New Budget from: ${budget.name}`,
        `Based on ${budget.project} (${budget.year})`,
        items,
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        toast.error("Budget not found — it may have been deleted.");
      } else if (status === 403) {
        toast.error("You don't have permission to access this budget.");
      } else if (!navigator.onLine) {
        toast.error("You're offline. Connect to the internet and try again.");
      } else {
        toast.error("Could not load this budget's details. Please try again.");
      }
    } finally {
      setFetchingHistorical(false);
    }
  };

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
      const status = error?.response?.status;
      if (status === 429) {
        toast.error("The AI assistant is temporarily rate-limited. Please wait a minute and try again.");
      } else if (status === 400) {
        toast.error("Your text couldn't be parsed — try rewording your budget description and try again.");
      } else if (status === 503 || status === 502) {
        toast.error("The AI service is temporarily unavailable. Please try again in a moment.");
      } else if (!navigator.onLine) {
        toast.error("You're offline. Connect to the internet to use the AI budget creator.");
      } else {
        toast.error("Failed to parse your budget text. Please check your connection and try again.");
      }
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async (items: PreviewBudgetItem[]) => {
    if (!budgetName || !selectedProject || !selectedYear) {
      toast.error(
        "Please fill in the Budget Name, Project, and Year above first.",
      );
      return;
    }
    setIsConfirming(true);
    try {
      await bulkCreateItemsMutation.mutateAsync({
        create: true,
        name: budgetName,
        project: selectedProject,
        year: Number(selectedYear),
        description,
        icon: previewIcon,
        budget_items: items.map((item) => ({
          budget: null,
          category: item.category_id || item.category,
          planned_amount: item.planned_amount,
          inventory: item.inventory,
          quantity: item.quantity,
          units: item.units,
        })),
      });
      toast.success(`Budget created with ${items.length} items!`);
      navigate("/budgets");
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const status = error?.response?.status;
      if (msg) {
        toast.error(msg);
      } else if (status === 409) {
        toast.error("A budget with this name already exists for the selected project and year.");
      } else if (status === 400) {
        toast.error("Some budget details are invalid. Please review your entries and try again.");
      } else if (!navigator.onLine) {
        toast.error("You're offline. Connect to the internet to create a budget.");
      } else {
        toast.error("Failed to create budget. Please check your connection and try again.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="gfm-page">
      {/* Header */}
      <div className="gfm-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="gfm-icon-btn"
            onClick={() => navigate("/budgets")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1.5px solid var(--gfm-ink-200)",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="gfm-h1">Create Budget</h1>
            <div className="gfm-h1-sub">
              Choose a method to start your budget
            </div>
          </div>
        </div>
      </div>

      {/* Metadata card */}
      <div className="gfm-card gfm-card-p">
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: "var(--gfm-ink-400)",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Budget details
        </div>
        <div className="gfm-grid gfm-grid-3" style={{ gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Budget Name</span>
            <input
              className="gfm-input"
              placeholder="e.g. 2026 Maize Season"
              value={budgetName}
              onChange={(e) => {
                setbudgetName(e.target.value);
                setValidationError("");
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Project</span>
            <select
              className="gfm-select"
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setValidationError("");
              }}
            >
              <option value="">Select project…</option>
              {projects.map((p: any) => {
                const id = (p.id || p.project_id).toString();
                const name = p.name || p.title || p.projectName;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Year</span>
            <select
              className="gfm-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Description (Optional)</span>
            <input
              className="gfm-input"
              placeholder="Brief description of this budget"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        {validationError && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "var(--gfm-danger-50)",
              border: "1px solid #fecaca",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--gfm-danger)",
              fontWeight: 600,
            }}
          >
            {validationError}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div className="gfm-seg" style={{ gap: 2 }}>
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
        {activeTab === "templates" && (
          <button
            className="gfm-btn gfm-btn-ghost gfm-btn-sm"
            onClick={handleSelectAllTemplates}
          >
            <LayoutGrid size={13} />
            Preview All Templates
          </button>
        )}
      </div>

      {/* Templates tab */}
      {activeTab === "templates" &&
        (templatesLoading ? (
          <div style={{ display: "grid", placeItems: "center", padding: 56 }}>
            <div className="gfm-spinner" />
          </div>
        ) : templates.length === 0 ? (
          <div className="gfm-empty" style={{ padding: "56px 28px" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              No templates available
            </div>
            <div style={{ fontSize: 13 }}>
              Check back later or use historical data.
            </div>
          </div>
        ) : (
          <div className="gfm-grid gfm-grid-3">
            {templates.map((template: any) => {
              const templateTotal = template.budget_items.reduce(
                (s: number, i: any) => s + i.planned_amount,
                0,
              );
              return (
                <div
                  key={template.id}
                  className="gfm-card gfm-card-p"
                  style={{
                    cursor: "pointer",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                  }}
                  onClick={() => handleSelectTemplate(template.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = "var(--gfm-shadow-lg)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>
                      {template.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--gfm-ink-900)",
                          marginBottom: 4,
                        }}
                      >
                        {template.name}
                      </div>
                      <div
                        className="gfm-muted"
                        style={{
                          fontSize: 12,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {template.description}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 5,
                      marginBottom: 12,
                    }}
                  >
                    {template.budget_items
                      .slice(0, 3)
                      .map((item: any, i: number) => (
                        <span key={i} className="gfm-badge">
                          {item.category_name}
                        </span>
                      ))}
                    {template.budget_items.length > 3 && (
                      <span className="gfm-badge">
                        +{template.budget_items.length - 3}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid var(--gfm-ink-100)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--gfm-green-600)",
                      }}
                    >
                      {fmtC(templateTotal)}
                    </span>
                    <button
                      className="gfm-btn gfm-btn-ghost gfm-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template.id);
                      }}
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {/* Historical tab */}
      {activeTab === "historical" &&
        (budgetsLoading || fetchingHistorical ? (
          <div style={{ display: "grid", placeItems: "center", padding: 56 }}>
            <div className="gfm-spinner" />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "var(--gfm-ink-400)",
              }}
            >
              {budgetsLoading
                ? "Loading previous budgets…"
                : "Fetching budget details…"}
            </div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="gfm-empty" style={{ padding: "56px 28px" }}>
            <Sprout
              size={28}
              style={{ margin: "0 auto 12px", color: "var(--gfm-green-400)" }}
            />
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              No historical budgets
            </div>
            <div style={{ fontSize: 13 }}>
              Create your first budget to use this feature later.
            </div>
          </div>
        ) : (
          <div className="gfm-grid gfm-grid-3">
            {budgets.map((budget: any) => (
              <div
                key={budget.id}
                className="gfm-card gfm-card-p"
                style={{ cursor: "pointer", transition: "box-shadow 0.15s" }}
                onClick={() => handleSelectHistorical(budget.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "var(--gfm-shadow-lg)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "var(--gfm-green-50)",
                      color: "var(--gfm-green-600)",
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                    }}
                  >
                    <History size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "var(--gfm-ink-900)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {budget.name}
                    </div>
                    <div
                      className="gfm-muted"
                      style={{ fontSize: 12, marginTop: 3 }}
                    >
                      {budget.project} · {budget.year}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid var(--gfm-ink-100)",
                  }}
                >
                  <div>
                    <div className="gfm-label" style={{ marginBottom: 2 }}>
                      Season total
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "var(--gfm-green-600)",
                      }}
                    >
                      {fmtC(budget.planned ?? 0)}
                    </div>
                  </div>
                  <button
                    className="gfm-btn gfm-btn-ghost gfm-btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHistorical(budget.id);
                    }}
                  >
                    Use as basis
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Text Import tab */}
      {activeTab === "text" && (
        <div className="gfm-card gfm-card-p" style={{ maxWidth: 680 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
            Describe your budget
          </div>
          <div className="gfm-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            List items and costs naturally in any language — AI will extract the
            line items for you.
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="gfm-label">Your budget description</span>
            <textarea
              className="gfm-input"
              style={{
                minHeight: 180,
                resize: "vertical",
                fontFamily: "inherit",
              }}
              placeholder={
                "e.g. I need seeds for 3000, fertilizer costing 4000, labor at 3500, transport for 2000, and pesticides worth 1200."
              }
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </label>
          <div
            style={{
              marginTop: 8,
              fontSize: 11.5,
              color: "var(--gfm-ink-400)",
            }}
          >
            Tip: write naturally — "seeds for 3000" or "5000 on fertilizer" both
            work.
          </div>
          <button
            className="gfm-btn gfm-btn-primary"
            style={{ marginTop: 16 }}
            onClick={handleParseText}
            disabled={parsing || !textInput.trim()}
          >
            {parsing ? (
              <>
                <div
                  className="gfm-spinner"
                  style={{ width: 14, height: 14, borderWidth: 2 }}
                />
                Parsing…
              </>
            ) : (
              <>
                <Eye size={14} />
                Preview Budget
              </>
            )}
          </button>
        </div>
      )}

      <BudgetPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        description={previewDescription}
        items={previewItems}
        onConfirm={handleConfirm}
        loading={isConfirming}
      />
    </div>
  );
};

export default CreateBudget;
