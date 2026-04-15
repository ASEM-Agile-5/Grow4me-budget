import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getBudgetsAPI, 
  getBudgetDetailsAPI, 
  getExpensesAPI, 
  getRecentExpensesAPI,
  getInventoryAPI, 
  getBudgetCategoriesAPI,
  createBudgetAPI,
  addBudgetItemAPI,
  createExpenseAPI,
  adjustInventoryStockAPI,
  setInventoryMinimumAPI,
  createBudgetCategoryAPI,
  getUserProjectsAPI,
  getDashboardSummaryAPI,
  getMonthlyExpensesAPI,
  getCategoryExpensesAPI,
  getSalesAPI,
  createSaleAPI,
  getInventoryHistoryAPI,
  bulkCreateBudgetItemsAPI,
  aiTranslateBudgetAPI,
  getBudgetTemplatesAPI,
  getFinancialsAPI,
  deleteBudgetItemAPI,
} from "@/services/services";
import { useState, useEffect } from "react";

// --- Types (Re-defining here if necessary, or importing if they exist) ---
export interface Budget {
  id: string;
  name: string;
  project: string;
  year: number;
  description: string;
  createdAt: string;
  planned: number;
  spent: number;
  left: number;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  category_name: string;
  planned_amount: number;
  spent: number;
}

export interface Expense {
  id: string;
  date: string;
  budget: string;
  budget_name: string;
  category_name: string;
  budget_item: string;
  notes: string;
  amount: string | number;
  inventory: boolean;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  budgetId: string;
  budgetItemId: string;
  name: string;
  category_name: string;
  units: string;
  current_stock: number;
  minimum_stock: number;
}

// --- Local Storage Helper for Selected Budget ---
const SELECTED_BUDGET_KEY = "active_budget_id";

export const useSelectedBudget = () => {
  const [selectedBudgetId, setSelectedBudgetIdState] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_BUDGET_KEY);
  });

  const setSelectedBudgetId = (id: string | null) => {
    if (id) {
      localStorage.setItem(SELECTED_BUDGET_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_BUDGET_KEY);
    }
    setSelectedBudgetIdState(id);
    // Trigger storage event for other components (like sidebar)
    window.dispatchEvent(new Event("storage_budget_change"));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedBudgetIdState(localStorage.getItem(SELECTED_BUDGET_KEY));
    };
    window.addEventListener("storage_budget_change", handleStorageChange);
    return () => window.removeEventListener("storage_budget_change", handleStorageChange);
  }, []);

  return { selectedBudgetId, setSelectedBudgetId };
};

// --- Queries ---

export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgetsAPI,
  });
};

export const useBudgetDetails = (budgetId: string | null) => {
  return useQuery({
    queryKey: ["budget-details", budgetId],
    queryFn: () => getBudgetDetailsAPI(budgetId!),
    enabled: !!budgetId,
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpensesAPI,
  });
};

export const useRecentExpenses = (budgetId: string | null) => {
  return useQuery({
    queryKey: ["recent-expenses", budgetId],
    queryFn: () => getRecentExpensesAPI(budgetId!),
    enabled: !!budgetId,
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventoryAPI(),
  });
};

export const useInventoryHistory = () => {
  return useQuery({
    queryKey: ["inventory-history"],
    queryFn: () => getInventoryHistoryAPI(),
  });
};

export const useBudgetCategories = () => {
  return useQuery({
    queryKey: ["budget-categories"],
    queryFn: getBudgetCategoriesAPI,
  });
};

export const useRevenues = () => {
  return useQuery({
    queryKey: ["revenues"],
    queryFn: getSalesAPI,
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getUserProjectsAPI,
  });
};

export const useBudgetTemplates = () => {
  return useQuery({
    queryKey: ["budget-templates"],
    queryFn: getBudgetTemplatesAPI,
  });
};

export const useDashboardSummary = (year: number | string) => {
  return useQuery({
    queryKey: ["dashboard-summary", year],
    queryFn: () => getDashboardSummaryAPI(year),
    enabled: !!year,
  });
};

export const useMonthlyExpenses = (year: number | string, budgetId?: string) => {
  return useQuery({
    queryKey: ["monthly-expenses", year, budgetId],
    queryFn: () => getMonthlyExpensesAPI(year, budgetId),
    enabled: !!year,
  });
};

export const useCategoryExpenses = (budgetId: string | null) => {
  return useQuery({
    queryKey: ["category-expenses", budgetId],
    queryFn: () => getCategoryExpensesAPI(budgetId!),
    enabled: !!budgetId,
  });
};

export const useFinancials = (year: number | string, budgetId?: string) => {
  return useQuery({
    queryKey: ["financials", year, budgetId],
    queryFn: () => getFinancialsAPI(year, budgetId),
    enabled: !!year,
  });
};

// --- Mutations ---

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudgetAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
       // Placeholder for deleteBudgetAPI(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useAddBudgetItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBudgetItemAPI,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget-details", variables.budget] });
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpenseAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budget-details"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustInventoryStockAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useSetInventoryMin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setInventoryMinimumAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudgetCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaleAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useBulkCreateBudgetItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateBudgetItemsAPI,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget-details"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useAITranslateBudget = () => {
  return useMutation({
    mutationFn: ({ text, file }: { text?: string; file?: File }) =>
      aiTranslateBudgetAPI(text, file),
  });
};

export const useDeleteBudgetItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudgetItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-details"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
