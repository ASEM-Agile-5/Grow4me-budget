/**
 * Budget Summary Generator
 * Aggregates all expenses and revenues for a budget cycle
 * and returns a structured summary report.
 */

const {
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateProfit,
  calculateROI,
  categorizeBudgetHealth,
} = require('./budgetCalculator');

function generateBudgetSummary(budget, expenses, revenues) {
  if (!budget) throw new Error('Budget object is required');

  const totalExpenses = calculateTotalExpenses(expenses);
  const totalRevenue  = calculateTotalRevenue(revenues);
  const profit        = calculateProfit(totalRevenue, totalExpenses);

  // ROI is only meaningful when there are expenses; guard against zero-division
  const roi = totalExpenses > 0 ? calculateROI(totalRevenue, totalExpenses) : 0;

  // Profit margin for health status requires non-zero revenue
  const healthStatus = totalRevenue > 0
    ? categorizeBudgetHealth(totalRevenue, totalExpenses)
    : 'Loss';

  const targetAchievedPercent = budget.targetRevenue > 0
    ? (totalRevenue / budget.targetRevenue) * 100
    : 0;

  const expenseBreakdown = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return {
    budgetId: budget.id,
    title: budget.title,
    totalExpenses,
    totalRevenue,
    profit,
    roi,
    healthStatus,
    targetAchievedPercent,
    expenseBreakdown,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateBudgetSummary };
