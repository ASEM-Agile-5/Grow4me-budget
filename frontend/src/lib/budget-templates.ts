export interface TemplateItem {
  id: string;
  category: string; // This is the category ID/UUID
  planned_amount: number;
  category_name: string; // For UI display
  description?: string;
  inventory: boolean;
  quantity: number;
  units: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  budget_items: TemplateItem[];
}
// Static budgetTemplates array removed. Data is now fetched from the API.
