import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
  useFinancials,
} from "@/hooks/use-budgets";

const currentYearStr = new Date().getFullYear().toString();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (parseInt(currentYearStr) - 2 + i).toString(),
);

const Reports = () => {
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    refetch: refetchBudgets,
  } = useBudgets();
  const { selectedBudgetId, setSelectedBudgetId } = useSelectedBudget();
  const {
    data: financials,
    isLoading: financialsLoading,
    error: financialsError,
  } = useFinancials(selectedYear, selectedBudgetId || undefined);

  const loading = budgetsLoading || financialsLoading;
  const error = financialsError ? "Failed to load financial reports" : null;

  // Use API data for calculations or fallbacks
  const summary = financials?.summary || {};
  const netProfit = summary.netProfit || 0;
  const totalExpenses = summary.totalExpenses || 0;
  const totalRevenue = summary.totalRevenue || 0;
  const totalBudget = summary.totalBudget || 0;
  const budgetUtilization = summary.budgetUtilization
    ? summary.budgetUtilization.toFixed(1)
    : "0.0";
  const revenuePerExpense = summary.revenuePerExpense || 0;

  // Charts
  const profitData = financials?.profitLossOverTime || [];
  const budgetVsActual = financials?.budgetVsActual || [];

  const categoryExpenseData = useMemo(() => {
    if (!financials?.expenseBreakdown) return [];
    return Object.entries(financials.expenseBreakdown).map(
      ([name, value], i) => ({
        name,
        value: value as number,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }),
    );
  }, [financials]);

  const selectedBudget = useMemo(
    () =>
      budgets.find(
        (b: any) => b.id.toString() === selectedBudgetId?.toString(),
      ),
    [budgets, selectedBudgetId],
  );

  if (loading && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
        <p className="text-muted-foreground font-medium">
          Loading report data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Financial analytics for the {selectedYear} season
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchBudgets()}>
            Refresh
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={(selectedBudgetId || "").toString()}
            onValueChange={setSelectedBudgetId}
          >
            <SelectTrigger className="w-48" id="reports-budget-picker">
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
          subtitle={
            netProfit >= 0 ? "Season is profitable" : "Season at a loss"
          }
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
          value={revenuePerExpense ? `${revenuePerExpense.toFixed(2)}x` : "—"}
          subtitle="Return on investment"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Profit over time */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Profit/Loss Over Time</h3>
        {profitData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            No data for this budget
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitData}>
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
                formatter={(v: number) => `GHS ${v.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget vs Actual */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Budget vs Actual</h3>
          {budgetVsActual.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No budget items
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetVsActual}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                  formatter={(v: number) => `GHS ${v.toLocaleString()}`}
                />
                <Bar
                  dataKey="budgeted"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  name="Budgeted"
                />
                <Bar
                  dataKey="actual"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                  name="Actual"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Expense Breakdown</h3>
          {categoryExpenseData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No expense data
            </p>
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
                  <Tooltip
                    formatter={(v: number) => `GHS ${v.toLocaleString()}`}
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
