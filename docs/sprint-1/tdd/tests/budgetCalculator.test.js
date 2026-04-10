/**
 * TDD – Sprint 1: Critical Component
 * Budget Calculator (Profit/Loss Engine)
 *
 * These tests are written FIRST (Red phase).
 * Run `npm test` — all tests should FAIL until the implementation is written.
 * Then implement src/budgetCalculator.js to make them pass (Green phase).
 * Then refactor without breaking tests (Refactor phase).
 */

const {
  calculateProfit,
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateROI,
  categorizeBudgetHealth,
} = require('../src/budgetCalculator');

// ─── calculateTotalExpenses ────────────────────────────────────────────────

describe('calculateTotalExpenses()', () => {
  test('sums an array of expense amounts', () => {
    const expenses = [
      { category: 'seeds', amount: 200 },
      { category: 'labor', amount: 350 },
      { category: 'fertilizer', amount: 150 },
    ];
    expect(calculateTotalExpenses(expenses)).toBe(700);
  });

  test('returns 0 when there are no expenses', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  test('handles a single expense correctly', () => {
    expect(calculateTotalExpenses([{ category: 'seeds', amount: 500 }])).toBe(500);
  });

  test('handles decimal amounts accurately', () => {
    const expenses = [
      { category: 'seeds', amount: 100.50 },
      { category: 'labor', amount: 200.75 },
    ];
    expect(calculateTotalExpenses(expenses)).toBeCloseTo(301.25, 2);
  });

  test('throws an error when a negative amount is provided', () => {
    const expenses = [{ category: 'seeds', amount: -50 }];
    expect(() => calculateTotalExpenses(expenses)).toThrow('Expense amounts must be non-negative');
  });

  test('throws when expenses argument is not an array', () => {
    expect(() => calculateTotalExpenses(null)).toThrow();
    expect(() => calculateTotalExpenses('invalid')).toThrow();
  });
});

// ─── calculateTotalRevenue ─────────────────────────────────────────────────

describe('calculateTotalRevenue()', () => {
  test('sums an array of revenue entries', () => {
    const revenues = [
      { crop: 'maize', amount: 1200 },
      { crop: 'tomatoes', amount: 800 },
    ];
    expect(calculateTotalRevenue(revenues)).toBe(2000);
  });

  test('returns 0 for an empty revenue array', () => {
    expect(calculateTotalRevenue([])).toBe(0);
  });

  test('throws when a negative revenue amount is provided', () => {
    const revenues = [{ crop: 'maize', amount: -100 }];
    expect(() => calculateTotalRevenue(revenues)).toThrow('Revenue amounts must be non-negative');
  });
});

// ─── calculateProfit ───────────────────────────────────────────────────────

describe('calculateProfit()', () => {
  test('returns positive profit when revenue exceeds expenses', () => {
    expect(calculateProfit(2000, 700)).toBe(1300);
  });

  test('returns negative profit (loss) when expenses exceed revenue', () => {
    expect(calculateProfit(500, 700)).toBe(-200);
  });

  test('returns zero when revenue equals expenses (break-even)', () => {
    expect(calculateProfit(700, 700)).toBe(0);
  });

  test('handles decimal inputs accurately', () => {
    expect(calculateProfit(1000.50, 400.25)).toBeCloseTo(600.25, 2);
  });

  test('throws when revenue is negative', () => {
    expect(() => calculateProfit(-100, 200)).toThrow('Revenue cannot be negative');
  });

  test('throws when expenses is negative', () => {
    expect(() => calculateProfit(200, -100)).toThrow('Expenses cannot be negative');
  });
});

// ─── calculateROI ──────────────────────────────────────────────────────────

describe('calculateROI()', () => {
  test('calculates return on investment as a percentage', () => {
    // ROI = ((revenue - expenses) / expenses) * 100
    expect(calculateROI(2000, 700)).toBeCloseTo(185.71, 1);
  });

  test('returns a negative ROI when there is a loss', () => {
    expect(calculateROI(500, 700)).toBeCloseTo(-28.57, 1);
  });

  test('returns 0% ROI at break-even', () => {
    expect(calculateROI(700, 700)).toBe(0);
  });

  test('throws when expenses are zero (division by zero guard)', () => {
    expect(() => calculateROI(1000, 0)).toThrow('Expenses must be greater than zero to calculate ROI');
  });
});

// ─── categorizeBudgetHealth ────────────────────────────────────────────────

describe('categorizeBudgetHealth()', () => {
  test('returns "Healthy" when profit margin is >= 20%', () => {
    // profit margin = profit / revenue * 100
    // revenue=1000, expenses=700, profit=300, margin=30% → Healthy
    expect(categorizeBudgetHealth(1000, 700)).toBe('Healthy');
  });

  test('returns "Moderate" when profit margin is between 5% and 19.99%', () => {
    // revenue=1000, expenses=900, profit=100, margin=10% → Moderate
    expect(categorizeBudgetHealth(1000, 900)).toBe('Moderate');
  });

  test('returns "At Risk" when profit margin is between 0% and 4.99%', () => {
    // revenue=1000, expenses=960, profit=40, margin=4% → At Risk
    expect(categorizeBudgetHealth(1000, 960)).toBe('At Risk');
  });

  test('returns "Loss" when there is a net loss', () => {
    // revenue=500, expenses=700, profit=-200 → Loss
    expect(categorizeBudgetHealth(500, 700)).toBe('Loss');
  });

  test('throws when revenue is zero (guard against divide-by-zero)', () => {
    expect(() => categorizeBudgetHealth(0, 0)).toThrow('Revenue must be greater than zero');
  });
});
