import { useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

import { useBudgets, useSelectedBudget, useExpenses, useRevenues, useBudgetDetails } from "@/hooks/use-budgets";

const Reports = () => {
  const { data: budgets = [], isLoading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useBudgets();
  const { selectedBudgetId, setSelectedBudgetId } = useSelectedBudget();
  const { data: allExpenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: allRevenues = [], isLoading: revenuesLoading } = useRevenues();
  const { data: selectedBudgetDetails, isLoading: detailsLoading } = useBudgetDetails(selectedBudgetId);

  const selectedBudget = useMemo(() => 
    budgets.find((b: any) => b.id.toString() === selectedBudgetId?.toString()),
    [budgets, selectedBudgetId]
  );

  const budgetItemsForSelected = selectedBudgetDetails?.budget_items || [];
  
  const expensesForSelected = useMemo(() => 
    allExpenses.filter((e: any) => e.budgetId?.toString() === selectedBudgetId?.toString()),
    [allExpenses, selectedBudgetId]
  );

  const revenuesForSelected = useMemo(() => 
    allRevenues.filter((r: any) => r.budgetId?.toString() === selectedBudgetId?.toString()),
    [allRevenues, selectedBudgetId]
  );

  const loading = budgetsLoading || expensesLoading || revenuesLoading || (!!selectedBudgetId && detailsLoading);
  const error = budgetsError ? "Failed to load reports" : null;

  const totalExpenses = expensesForSelected.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = revenuesForSelected.reduce((s, r) => s + r.total, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalBudget = budgetItemsForSelected.reduce((s, b) => s + b.planned, 0);
  const budgetUtilization = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : "0.0";

  // Profit over time
  const profitData = useMemo(() => {
    const months: Record<string, { revenue: number; expenses: number }> = {};
    expensesForSelected.forEach((e) => {
      const key = new Date(e.date).toLocaleString("default", { month: "short" });
      if (!months[key]) months[key] = { revenue: 0, expenses: 0 };
      months[key].expenses += e.amount;
    });
    revenuesForSelected.forEach((r) => {
      const key = new Date(r.date).toLocaleString("default", { month: "short" });
      if (!months[key]) months[key] = { revenue: 0, expenses: 0 };
      months[key].revenue += r.total;
    });
    return Object.entries(months).map(([month, d]) => ({
      month,
      revenue: d.revenue,
      expenses: d.expenses,
      profit: d.revenue - d.expenses,
    }));
  }, [expensesForSelected, revenuesForSelected]);

  // Budget vs Actual
  const budgetVsActual = budgetItemsForSelected.map((b) => ({
    category: b.category,
    planned: b.planned,
    actual: b.actual,
  }));

  // Category expense breakdown
  const categoryExpenseData = useMemo(() => {
    const cats: Record<string, number> = {};
    expensesForSelected.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats).map(([name, value], i) => ({
      name,
      value,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [expensesForSelected]);

  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Financial analytics for {selectedBudget ? selectedBudget.name : "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
            Refresh
          </Button>
          <Select value={(selectedBudgetId || "").toString()} onValueChange={setSelectedBudgetId}>
            <SelectTrigger className="w-52" id="reports-budget-picker">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Net Profit/Loss"
          value={`GHS ${netProfit.toLocaleString()}`}
          subtitle={netProfit >= 0 ? "Season is profitable" : "Season at a loss"}
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          variant={netProfit >= 0 ? "success" : "danger"}
        />
        <StatCard
          title="Budget Utilization"
          value={`${budgetUtilization}%`}
          subtitle={`GHS ${totalExpenses.toLocaleString()} of ${totalBudget.toLocaleString()}`}
          icon={BarChart3}
          variant={Number(budgetUtilization) > 100 ? "danger" : "default"}
        />
        <StatCard
          title="Revenue per Expense"
          value={totalExpenses > 0 ? `${(totalRevenue / totalExpenses).toFixed(2)}x` : "—"}
          subtitle="Return on investment"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Profit over time */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Profit/Loss Over Time</h3>
        {profitData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">No data for this budget</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
              <Tooltip
                contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(40, 20%, 88%)", fontSize: 13 }}
                formatter={(v: number) => `GHS ${v.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(142, 60%, 40%)" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="hsl(38, 70%, 55%)" strokeWidth={2.5} dot={{ r: 4 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget vs Actual */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Budget vs Actual</h3>
          {budgetVsActual.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No budget items</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(150, 10%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <Tooltip
                  contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(40, 20%, 88%)", fontSize: 13 }}
                  formatter={(v: number) => `GHS ${v.toLocaleString()}`}
                />
                <Bar dataKey="planned" fill="hsl(142, 45%, 28%)" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="hsl(38, 70%, 55%)" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Expense Breakdown</h3>
          {categoryExpenseData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No expense data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categoryExpenseData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `GHS ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {categoryExpenseData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                    {c.name}: GHS {c.value.toLocaleString()}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
