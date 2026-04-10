/**
 * Budget Calculator
 * Core financial calculation engine for the Farm Budget module.
 */

function calculateTotalExpenses(expenses) {
  if (!Array.isArray(expenses)) throw new TypeError('expenses must be an array');
  for (const e of expenses) {
    if (e.amount < 0) throw new RangeError('Expense amounts must be non-negative');
  }
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function calculateTotalRevenue(revenues) {
  if (!Array.isArray(revenues)) throw new TypeError('revenues must be an array');
  for (const r of revenues) {
    if (r.amount < 0) throw new RangeError('Revenue amounts must be non-negative');
  }
  return revenues.reduce((sum, r) => sum + r.amount, 0);
}

function calculateProfit(revenue, expenses) {
  if (revenue < 0) throw new RangeError('Revenue cannot be negative');
  if (expenses < 0) throw new RangeError('Expenses cannot be negative');
  return revenue - expenses;
}

function calculateROI(revenue, expenses) {
  if (expenses === 0) throw new RangeError('Expenses must be greater than zero to calculate ROI');
  return ((revenue - expenses) / expenses) * 100;
}

function categorizeBudgetHealth(revenue, expenses) {
  if (revenue === 0) throw new RangeError('Revenue must be greater than zero');
  const profit = revenue - expenses;
  const margin = (profit / revenue) * 100;
  if (margin >= 20) return 'Healthy';
  if (margin >= 5)  return 'Moderate';
  if (margin >= 0)  return 'At Risk';
  return 'Loss';
}

module.exports = {
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateProfit,
  calculateROI,
  categorizeBudgetHealth,
};
