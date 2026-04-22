import { useMemo, useEffect } from "react";
import { Wallet, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";

const CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
];

import {
  useBudgets,
  useSelectedBudget,
  useBudgetDetails,
  useExpenses,
  useDashboardSummary,
  useMonthlyExpenses,
  useCategoryExpenses,
} from "@/hooks/use-budgets";

const Dashboard = () => {
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    error: budgetsError,
    refetch: refetchBudgets,
  } = useBudgets();
  const { selectedBudgetId, setSelectedBudgetId } = useSelectedBudget();

  useEffect(() => {
    if (!selectedBudgetId && budgets.length > 0) {
      setSelectedBudgetId(budgets[0].id.toString());
    }
  }, [budgets, selectedBudgetId, setSelectedBudgetId]);
  const { data: budgetDetails, isLoading: detailsLoading } =
    useBudgetDetails(selectedBudgetId);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();

  const selectedBudget = budgets.find(
    (b: any) => b.id.toString() === selectedBudgetId?.toString(),
  );
  const year = selectedBudget?.year || new Date().getFullYear();

  const { data: summaryData, isLoading: summaryLoading } =
    useDashboardSummary(year);
  // Total monthly data (for the whole year/all budgets)
  const { data: totalMonthlyDataResponse, isLoading: totalMonthlyLoading } =
    useMonthlyExpenses(year);
  // Budget-specific monthly data
  const { data: monthlyDataResponse, isLoading: monthlyLoading } = 
    useMonthlyExpenses(year, selectedBudgetId || undefined);
  const { data: categoryDataResponse, isLoading: categoryLoading } =
    useCategoryExpenses(selectedBudgetId);

  const expensesForSelected = expenses.filter(
    (e: any) => e.budgetId?.toString() === selectedBudgetId?.toString(),
  );
  const revenuesForSelected: any[] = []; // Assuming no revenue API for now

  const totalBudget = summaryData?.["Total Budget"] || 0;
  const totalRevenue = summaryData?.["Revenue"] || 0;
  const netProfit = summaryData?.["Net Profit"] || 0;

  const monthlyExpensesValues = monthlyDataResponse
    ? (Object.values(monthlyDataResponse) as number[])
    : [];
  const totalExpenses = monthlyExpensesValues.reduce((s, v) => s + v, 0);

  const loading =
    budgetsLoading ||
    detailsLoading ||
    expensesLoading ||
    summaryLoading ||
    monthlyLoading ||
    categoryLoading;
  const error = budgetsError ? "Failed to load dashboard data" : null;

  // Budget-specific monthly chart data
  const monthlyExpenseData = useMemo(() => {
    if (!monthlyDataResponse) return [];
    return Object.entries(monthlyDataResponse).map(([month, amount]) => ({
      month,
      amount: Number(amount),
    }));
  }, [monthlyDataResponse]);

  // Total monthly chart data (all budgets)
  const totalMonthlyExpenseData = useMemo(() => {
    if (!totalMonthlyDataResponse) return [];
    return Object.entries(totalMonthlyDataResponse).map(([month, amount]) => ({
      month,
      amount: Number(amount),
    }));
  }, [totalMonthlyDataResponse]);

  // Category breakdown chart data
  const categoryExpenseData = useMemo(() => {
    if (!categoryDataResponse) return [];
    return Object.entries(categoryDataResponse).map(([name, value], i) => ({
      name,
      value: Number(value),
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [categoryDataResponse]);

  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedBudget ? selectedBudget.name : "Select a budget"} overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
            Refresh
          </Button>
          <Select
            value={selectedBudgetId ?? ""}
            onValueChange={setSelectedBudgetId}
          >
            <SelectTrigger className="w-52" id="dashboard-budget-picker">
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
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hero Card */}
        <div className="lg:col-span-2">
          <StatCard
            title="Total Budget Balance"
            value={`GHS ${totalBudget.toLocaleString()}`}
            subtitle={selectedBudget ? `${selectedBudget.name} · ${selectedBudget.year}` : "Select a budget"}
            icon={Wallet}
            variant="hero"
            className="h-full min-h-[160px]"
          />
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col rounded-2xl border bg-card/60 p-4 transition-all hover:bg-card/80">
            <div className="mb-2 h-10 w-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Spent</p>
            <p className="text-lg font-bold">GHS {totalExpenses.toLocaleString()}</p>
          </div>
          
          <div className="flex flex-col rounded-2xl border bg-card/60 p-4 transition-all hover:bg-card/80">
            <div className="mb-2 h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
            <p className="text-lg font-bold">GHS {totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="flex flex-col rounded-2xl border bg-card/60 p-4 transition-all hover:bg-card/80 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  netProfit >= 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                }`}>
                  {netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Net Profit</p>
                  <p className="text-lg font-bold">GHS {netProfit.toLocaleString()}</p>
                </div>
              </div>
              <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                netProfit >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-destructive/20 text-destructive"
              }`}>
                {netProfit >= 0 ? "+2.4%" : "-1.2%"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly expenses by budget */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-primary/80">
            Monthly Expenses: {selectedBudget?.name || "Selected Budget"}
          </h3>
          {monthlyExpenseData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No expense data for this budget
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyExpenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "1rem",
                    border: "1px solid hsl(var(--border))",
                    backdropFilter: "blur(10px)",
                    fontSize: 13,
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  formatter={(value: number) => [
                    `GHS ${value.toLocaleString()}`,
                    "Expenses",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                  className="transition-all duration-300"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Expenses by Category</h3>
          {categoryExpenseData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No expense data for this budget
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryExpenseData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `GHS ${value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {categoryExpenseData.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.fill }}
                    />
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Total Monthly Expenses (All Projects)</h3>
        {totalMonthlyExpenseData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            No aggregated data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={totalMonthlyExpenseData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                    borderRadius: "1rem",
                    border: "1px solid hsl(var(--border))",
                    backdropFilter: "blur(10px)",
                  fontSize: 13,
                  color: "hsl(var(--foreground))",
                }}
                itemStyle={{ color: "hsl(var(--chart-3))" }}
                formatter={(value: number) => [
                  `GHS ${value.toLocaleString()}`,
                  "Total Expenses",
                ]}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--chart-3))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
