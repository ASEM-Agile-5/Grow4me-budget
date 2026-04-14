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
  "hsl(142, 45%, 28%)",
  "hsl(38, 70%, 55%)",
  "hsl(28, 50%, 45%)",
  "hsl(142, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(200, 60%, 45%)",
  "hsl(270, 50%, 55%)",
  "hsl(330, 50%, 50%)",
  "hsl(60, 60%, 45%)",
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

  // Monthly expenses chart data
  const monthlyExpenseData = useMemo(() => {
    if (!monthlyDataResponse) return [];
    return Object.entries(monthlyDataResponse).map(([month, amount]) => ({
      month,
      amount: Number(amount),
    }));
  }, [monthlyDataResponse]);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Budget"
          value={`GHS ${totalBudget.toLocaleString()}`}
          subtitle="Planned spending"
          icon={Wallet}
        />
        <StatCard
          title="Expenses"
          value={`GHS ${totalExpenses.toLocaleString()}`}
          subtitle={
            totalBudget > 0
              ? `${((totalExpenses / totalBudget) * 100).toFixed(0)}% of budget`
              : "No budget set"
          }
          icon={Receipt}
          variant="warning"
        />
        <StatCard
          title="Revenue"
          value={`GHS ${totalRevenue.toLocaleString()}`}
          subtitle={`${revenuesForSelected.filter((r) => r.status === "pending").length} pending`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Net Profit"
          value={`GHS ${netProfit.toLocaleString()}`}
          subtitle={netProfit >= 0 ? "Profitable" : "Loss"}
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          variant={netProfit >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly expenses */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Total Monthly Expenses</h3>
          {monthlyExpenseData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No expense data for this budget
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyExpenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(40, 20%, 88%)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(150, 10%, 45%)"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(40, 20%, 88%)",
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [
                    `GHS ${value.toLocaleString()}`,
                    "Expenses",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(142, 45%, 28%)"
                  radius={[6, 6, 0, 0]}
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

      {/* Recent expenses */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Recent Expenses</h3>
        {expensesForSelected.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses for this budget
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Notes</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expensesForSelected.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3">{e.notes}</td>
                    <td className="py-3 text-right font-medium">
                      GHS {e.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
