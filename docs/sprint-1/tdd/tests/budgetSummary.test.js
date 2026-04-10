/**
 * TDD – Sprint 1: Critical Component
 * Budget Summary Generator
 *
 * Aggregates expenses and revenues for a given budget cycle
 * and produces a structured summary report.
 * Tests are written FIRST. Implement src/budgetSummary.js to pass these.
 */

const { generateBudgetSummary } = require('../src/budgetSummary');

const sampleBudget = {
  id: 'budget_001',
  title: 'Maize Season 2026',
  farmerId: 'farmer_001',
  targetRevenue: 5000,
};

const sampleExpenses = [
  { category: 'seeds',      amount: 300,  date: '2026-03-10' },
  { category: 'fertilizer', amount: 200,  date: '2026-03-15' },
  { category: 'labor',      amount: 400,  date: '2026-04-01' },
  { category: 'labor',      amount: 150,  date: '2026-05-01' },
  { category: 'transport',  amount: 100,  date: '2026-06-20' },
];

const sampleRevenues = [
  { crop: 'maize',    amount: 2000, date: '2026-07-10' },
  { crop: 'tomatoes', amount: 1200, date: '2026-07-15' },
];

// ─── Structure & Shape ─────────────────────────────────────────────────────

describe('generateBudgetSummary() — output structure', () => {
  let summary;

  beforeEach(() => {
    summary = generateBudgetSummary(sampleBudget, sampleExpenses, sampleRevenues);
  });

  test('returns an object with all required top-level keys', () => {
    expect(summary).toHaveProperty('budgetId');
    expect(summary).toHaveProperty('title');
    expect(summary).toHaveProperty('totalExpenses');
    expect(summary).toHaveProperty('totalRevenue');
    expect(summary).toHaveProperty('profit');
    expect(summary).toHaveProperty('roi');
    expect(summary).toHaveProperty('healthStatus');
    expect(summary).toHaveProperty('targetAchievedPercent');
    expect(summary).toHaveProperty('expenseBreakdown');
    expect(summary).toHaveProperty('generatedAt');
  });

  test('budgetId matches the supplied budget', () => {
    expect(summary.budgetId).toBe('budget_001');
  });

  test('generatedAt is a valid ISO date string', () => {
    expect(() => new Date(summary.generatedAt)).not.toThrow();
    expect(new Date(summary.generatedAt).toISOString()).toBe(summary.generatedAt);
  });
});

// ─── Calculation Accuracy ─────────────────────────────────────────────────

describe('generateBudgetSummary() — calculations', () => {
  let summary;

  beforeEach(() => {
    summary = generateBudgetSummary(sampleBudget, sampleExpenses, sampleRevenues);
  });

  test('calculates totalExpenses correctly (300+200+400+150+100 = 1150)', () => {
    expect(summary.totalExpenses).toBe(1150);
  });

  test('calculates totalRevenue correctly (2000+1200 = 3200)', () => {
    expect(summary.totalRevenue).toBe(3200);
  });

  test('calculates profit correctly (3200-1150 = 2050)', () => {
    expect(summary.profit).toBe(2050);
  });

  test('calculates ROI correctly ((2050/1150)*100 ≈ 178.26%)', () => {
    expect(summary.roi).toBeCloseTo(178.26, 1);
  });

  test('calculates targetAchievedPercent correctly (3200/5000 * 100 = 64%)', () => {
    expect(summary.targetAchievedPercent).toBeCloseTo(64, 0);
  });
});

// ─── Expense Breakdown ─────────────────────────────────────────────────────

describe('generateBudgetSummary() — expense breakdown by category', () => {
  let summary;

  beforeEach(() => {
    summary = generateBudgetSummary(sampleBudget, sampleExpenses, sampleRevenues);
  });

  test('groups expenses by category', () => {
    expect(summary.expenseBreakdown).toHaveProperty('seeds');
    expect(summary.expenseBreakdown).toHaveProperty('fertilizer');
    expect(summary.expenseBreakdown).toHaveProperty('labor');
    expect(summary.expenseBreakdown).toHaveProperty('transport');
  });

  test('correctly aggregates multiple entries in the same category', () => {
    // labor: 400 + 150 = 550
    expect(summary.expenseBreakdown.labor).toBe(550);
  });

  test('categories with a single entry sum correctly', () => {
    expect(summary.expenseBreakdown.seeds).toBe(300);
    expect(summary.expenseBreakdown.fertilizer).toBe(200);
    expect(summary.expenseBreakdown.transport).toBe(100);
  });
});

// ─── Health Status ─────────────────────────────────────────────────────────

describe('generateBudgetSummary() — health status', () => {
  test('reports "Healthy" when profit margin >= 20%', () => {
    // totalRevenue=3200, totalExpenses=1150 → margin ≈ 64% → Healthy
    const summary = generateBudgetSummary(sampleBudget, sampleExpenses, sampleRevenues);
    expect(summary.healthStatus).toBe('Healthy');
  });

  test('reports "Loss" when expenses exceed revenue', () => {
    const highExpenses = [{ category: 'labor', amount: 5000, date: '2026-04-01' }];
    const lowRevenues  = [{ crop: 'maize', amount: 1000, date: '2026-07-01' }];
    const summary = generateBudgetSummary(sampleBudget, highExpenses, lowRevenues);
    expect(summary.healthStatus).toBe('Loss');
  });
});

// ─── Edge Cases ────────────────────────────────────────────────────────────

describe('generateBudgetSummary() — edge cases', () => {
  test('handles a budget with zero expenses gracefully', () => {
    const summary = generateBudgetSummary(sampleBudget, [], sampleRevenues);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.profit).toBe(summary.totalRevenue);
  });

  test('handles a budget with zero revenue gracefully (reports Loss)', () => {
    const summary = generateBudgetSummary(sampleBudget, sampleExpenses, []);
    expect(summary.totalRevenue).toBe(0);
    expect(summary.profit).toBeLessThan(0);
    expect(summary.healthStatus).toBe('Loss');
  });

  test('throws when budget object is null', () => {
    expect(() => generateBudgetSummary(null, sampleExpenses, sampleRevenues)).toThrow();
  });
});
