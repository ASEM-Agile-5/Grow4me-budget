export interface Budget {
  id: string;
  name: string;
  project: string;
  year: number;
  description: string;
  createdAt: string;
}

export type InventoryUnit = "kg" | "litres" | "lbs" | "bags" | "units" | "crates" | "tonnes";

export interface BudgetItem {
  id: string;
  budgetId: string;
  category: string;
  description: string;
  planned: number;
  actual: number;
  trackInventory: boolean;
  inventoryUnit?: InventoryUnit;
}

export interface Expense {
  id: string;
  budgetId: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
  inventoryQuantity?: number;
}

export interface Revenue {
  id: string;
  budgetId: string;
  product: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  date: string;
  status: "paid" | "pending";
  buyer?: string;
}

export interface InventoryItem {
  id: string;
  budgetId: string;
  budgetItemId: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
}

export interface InventoryLog {
  id: string;
  inventoryItemId: string;
  type: "added" | "reduced" | "adjustment";
  quantity: number;
  date: string;
  notes: string;
}

export const inventoryUnits: { value: InventoryUnit; label: string }[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "litres", label: "Litres (L)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "bags", label: "Bags" },
  { value: "units", label: "Units" },
  { value: "crates", label: "Crates" },
  { value: "tonnes", label: "Tonnes" },
];

export const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "2026 Maize Season",
    project: "Maize Farm",
    year: 2026,
    description: "Main maize cultivation season covering land prep through harvest",
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "2025 Poultry Cycle",
    project: "Poultry Unit",
    year: 2025,
    description: "Layer hen cycle including feed, housing maintenance and vet care",
    createdAt: "2025-08-01",
  },
  {
    id: "3",
    name: "2026 Vegetable Garden",
    project: "Vegetable Plot",
    year: 2026,
    description: "Mixed vegetable production — tomatoes, peppers, onions",
    createdAt: "2026-02-10",
  },
];

export const mockBudgetItems: BudgetItem[] = [
  // Budget 1 — Maize
  { id: "1", budgetId: "1", category: "Seeds", description: "Hybrid maize seeds for 5 acres — targeting drought-resistant OPV and hybrid varieties", planned: 3000, actual: 2800, trackInventory: true, inventoryUnit: "bags" },
  { id: "2", budgetId: "1", category: "Fertilizer", description: "NPK 15-15-15 basal application and urea top dressing for all plots", planned: 4000, actual: 4200, trackInventory: true, inventoryUnit: "bags" },
  { id: "3", budgetId: "1", category: "Labor", description: "Land clearing, plowing, planting and weeding labor costs", planned: 3500, actual: 3000, trackInventory: false },
  { id: "4", budgetId: "1", category: "Transport", description: "Delivery of inputs from town to farm and harvest transport to market", planned: 2000, actual: 1800, trackInventory: false },
  { id: "5", budgetId: "1", category: "Equipment", description: "Sprayer hire, cutlass purchase, and hoe replacement", planned: 2500, actual: 2100, trackInventory: true, inventoryUnit: "units" },
  { id: "misc-1", budgetId: "1", category: "Miscellaneous", description: "Unplanned expenses and minor farm costs", planned: 0, actual: 0, trackInventory: false },
  // Budget 2 — Poultry
  { id: "6", budgetId: "2", category: "Feed", description: "Starter, grower and layer feed for 200 birds over the cycle", planned: 4000, actual: 3800, trackInventory: true, inventoryUnit: "bags" },
  { id: "7", budgetId: "2", category: "Vet/Medicine", description: "Vaccination schedule, deworming and emergency medication supplies", planned: 1500, actual: 1200, trackInventory: true, inventoryUnit: "units" },
  { id: "8", budgetId: "2", category: "Labor", description: "Caretaker salary and occasional labor for coop cleaning", planned: 1500, actual: 1400, trackInventory: false },
  { id: "9", budgetId: "2", category: "Equipment", description: "Feeders, drinkers, egg trays and lighting bulbs", planned: 1500, actual: 900, trackInventory: true, inventoryUnit: "units" },
  { id: "misc-2", budgetId: "2", category: "Miscellaneous", description: "Unplanned poultry expenses", planned: 0, actual: 0, trackInventory: false },
  // Budget 3 — Vegetables
  { id: "10", budgetId: "3", category: "Seeds", description: "Tomato, pepper and onion seedlings from certified nursery", planned: 1200, actual: 1100, trackInventory: true, inventoryUnit: "units" },
  { id: "11", budgetId: "3", category: "Fertilizer", description: "Organic manure and foliar fertilizer for vegetable beds", planned: 1500, actual: 1300, trackInventory: true, inventoryUnit: "bags" },
  { id: "12", budgetId: "3", category: "Labor", description: "Bed preparation, transplanting, staking and regular harvesting", planned: 1300, actual: 800, trackInventory: false },
  { id: "13", budgetId: "3", category: "Pesticides", description: "Fungicide and insecticide for tomato blight and aphid control", planned: 1000, actual: 600, trackInventory: true, inventoryUnit: "litres" },
  { id: "misc-3", budgetId: "3", category: "Miscellaneous", description: "Other unplanned vegetable production costs", planned: 0, actual: 0, trackInventory: false },
];

export const mockInventory: InventoryItem[] = [
  { id: "inv-1", budgetId: "1", budgetItemId: "1", name: "Hybrid Maize Seeds", category: "Seeds", unit: "bags", currentStock: 12, minimumStock: 5 },
  { id: "inv-2", budgetId: "1", budgetItemId: "2", name: "NPK Fertilizer", category: "Fertilizer", unit: "bags", currentStock: 3, minimumStock: 8 },
  { id: "inv-3", budgetId: "1", budgetItemId: "5", name: "Farm Equipment", category: "Equipment", unit: "units", currentStock: 4, minimumStock: 2 },
  { id: "inv-4", budgetId: "2", budgetItemId: "6", name: "Poultry Feed", category: "Feed", unit: "bags", currentStock: 2, minimumStock: 5 },
  { id: "inv-5", budgetId: "2", budgetItemId: "7", name: "Vaccines & Medicine", category: "Vet/Medicine", unit: "units", currentStock: 15, minimumStock: 10 },
  { id: "inv-6", budgetId: "2", budgetItemId: "9", name: "Feeders & Drinkers", category: "Equipment", unit: "units", currentStock: 20, minimumStock: 5 },
  { id: "inv-7", budgetId: "3", budgetItemId: "10", name: "Vegetable Seedlings", category: "Seeds", unit: "units", currentStock: 0, minimumStock: 50 },
  { id: "inv-8", budgetId: "3", budgetItemId: "11", name: "Organic Manure", category: "Fertilizer", unit: "bags", currentStock: 8, minimumStock: 4 },
  { id: "inv-9", budgetId: "3", budgetItemId: "13", name: "Pesticide Solution", category: "Pesticides", unit: "litres", currentStock: 5, minimumStock: 3 },
];

export const mockInventoryLogs: InventoryLog[] = [
  { id: "log-1", inventoryItemId: "inv-1", type: "added", quantity: 15, date: "2026-03-05", notes: "Initial seed purchase" },
  { id: "log-2", inventoryItemId: "inv-1", type: "reduced", quantity: 3, date: "2026-03-15", notes: "Planted first 3 acres" },
  { id: "log-3", inventoryItemId: "inv-2", type: "added", quantity: 10, date: "2026-03-12", notes: "NPK delivery" },
  { id: "log-4", inventoryItemId: "inv-2", type: "reduced", quantity: 7, date: "2026-03-20", notes: "Basal application" },
  { id: "log-5", inventoryItemId: "inv-4", type: "added", quantity: 8, date: "2025-09-10", notes: "Starter feed batch" },
  { id: "log-6", inventoryItemId: "inv-4", type: "reduced", quantity: 6, date: "2025-10-15", notes: "Monthly consumption" },
];

export const mockExpenses: Expense[] = [
  // Budget 1 — Maize
  { id: "1", budgetId: "1", category: "Seeds", amount: 1200, date: "2026-03-05", notes: "Hybrid maize seeds", inventoryQuantity: 15 },
  { id: "2", budgetId: "1", category: "Fertilizer", amount: 2100, date: "2026-03-12", notes: "NPK fertilizer", inventoryQuantity: 10 },
  { id: "3", budgetId: "1", category: "Labor", amount: 800, date: "2026-03-15", notes: "Land clearing" },
  { id: "4", budgetId: "1", category: "Seeds", amount: 1600, date: "2026-03-20", notes: "Additional seeds", inventoryQuantity: 8 },
  { id: "5", budgetId: "1", category: "Transport", amount: 600, date: "2026-04-01", notes: "Fertilizer delivery" },
  { id: "6", budgetId: "1", category: "Labor", amount: 1200, date: "2026-04-05", notes: "Planting crew" },
  { id: "7", budgetId: "1", category: "Fertilizer", amount: 2100, date: "2026-04-10", notes: "Top dressing", inventoryQuantity: 12 },
  { id: "8", budgetId: "1", category: "Equipment", amount: 950, date: "2026-04-12", notes: "Sprayer hire", inventoryQuantity: 2 },
  // Budget 2 — Poultry
  { id: "9", budgetId: "2", category: "Feed", amount: 2000, date: "2025-09-10", notes: "Starter feed batch", inventoryQuantity: 8 },
  { id: "10", budgetId: "2", category: "Feed", amount: 1800, date: "2025-10-05", notes: "Grower feed", inventoryQuantity: 7 },
  { id: "11", budgetId: "2", category: "Vet/Medicine", amount: 1200, date: "2025-10-20", notes: "Vaccination round", inventoryQuantity: 20 },
  { id: "12", budgetId: "2", category: "Labor", amount: 1400, date: "2025-11-01", notes: "Caretaker wages" },
  // Budget 3 — Vegetables
  { id: "13", budgetId: "3", category: "Seeds", amount: 1100, date: "2026-02-15", notes: "Tomato & pepper seedlings", inventoryQuantity: 200 },
  { id: "14", budgetId: "3", category: "Fertilizer", amount: 1300, date: "2026-02-25", notes: "Organic manure", inventoryQuantity: 10 },
  { id: "15", budgetId: "3", category: "Labor", amount: 800, date: "2026-03-01", notes: "Bed preparation" },
];

export const mockRevenue: Revenue[] = [
  // Budget 1 — Maize
  { id: "1", budgetId: "1", product: "Maize (bags)", quantity: 50, pricePerUnit: 200, total: 10000, date: "2026-07-15", status: "paid", buyer: "Ama Traders" },
  { id: "2", budgetId: "1", product: "Maize (bags)", quantity: 30, pricePerUnit: 210, total: 6300, date: "2026-07-20", status: "paid", buyer: "Kofi Market" },
  { id: "3", budgetId: "1", product: "Maize (bags)", quantity: 20, pricePerUnit: 195, total: 3900, date: "2026-08-01", status: "pending", buyer: "Village Co-op" },
  // Budget 2 — Poultry
  { id: "4", budgetId: "2", product: "Eggs (crates)", quantity: 100, pricePerUnit: 35, total: 3500, date: "2025-12-10", status: "paid", buyer: "Market Women" },
  { id: "5", budgetId: "2", product: "Eggs (crates)", quantity: 80, pricePerUnit: 38, total: 3040, date: "2026-01-15", status: "paid", buyer: "Kwame Shop" },
];

export const expenseCategories = ["Seeds", "Fertilizer", "Labor", "Transport", "Equipment", "Feed", "Vet/Medicine", "Pesticides", "Other"];
export const cropTypes = ["Maize", "Rice", "Cassava", "Yam", "Poultry", "Piggery", "Cattle", "Fish", "Vegetables", "Other"];
