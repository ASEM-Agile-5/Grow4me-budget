/**
 * TDD – Sprint 1: Critical Component
 * Input Validator (Data Validation Layer)
 *
 * Validates all data entering the Farm Budget system.
 * Tests are written FIRST. Implement src/inputValidator.js to make them pass.
 */

const {
  validateBudgetEntry,
  validateExpenseEntry,
  validateRevenueEntry,
  validateUser,
} = require('../src/inputValidator');

// ─── validateBudgetEntry ───────────────────────────────────────────────────

describe('validateBudgetEntry()', () => {
  const validBudget = {
    title: 'Maize Season 2026',
    season: 'March - July 2026',
    farmerId: 'farmer_001',
    targetRevenue: 5000,
  };

  test('accepts a valid budget entry without errors', () => {
    const result = validateBudgetEntry(validBudget);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects a budget with a missing title', () => {
    const result = validateBudgetEntry({ ...validBudget, title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('rejects a budget with a missing farmerId', () => {
    const result = validateBudgetEntry({ ...validBudget, farmerId: undefined });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Farmer ID is required');
  });

  test('rejects a budget with a negative targetRevenue', () => {
    const result = validateBudgetEntry({ ...validBudget, targetRevenue: -100 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Target revenue must be a positive number');
  });

  test('rejects a budget with a non-numeric targetRevenue', () => {
    const result = validateBudgetEntry({ ...validBudget, targetRevenue: 'abc' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Target revenue must be a positive number');
  });

  test('collects multiple errors at once', () => {
    const result = validateBudgetEntry({ title: '', farmerId: '', targetRevenue: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── validateExpenseEntry ──────────────────────────────────────────────────

describe('validateExpenseEntry()', () => {
  const validExpense = {
    budgetId: 'budget_001',
    category: 'seeds',
    description: 'Hybrid maize seeds',
    amount: 200,
    date: '2026-03-15',
  };

  const VALID_CATEGORIES = ['seeds', 'fertilizer', 'labor', 'equipment', 'transport', 'other'];

  test('accepts a valid expense entry', () => {
    const result = validateExpenseEntry(validExpense);
    expect(result.isValid).toBe(true);
  });

  test('rejects an expense with no budgetId', () => {
    const result = validateExpenseEntry({ ...validExpense, budgetId: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Budget ID is required');
  });

  test('rejects an expense with an invalid category', () => {
    const result = validateExpenseEntry({ ...validExpense, category: 'vacation' });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid category/);
  });

  test('rejects an expense with amount = 0', () => {
    const result = validateExpenseEntry({ ...validExpense, amount: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be greater than zero');
  });

  test('rejects an expense with an invalid date format', () => {
    const result = validateExpenseEntry({ ...validExpense, date: '15-03-2026' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Date must be in YYYY-MM-DD format');
  });

  test('rejects an expense with a future date', () => {
    const result = validateExpenseEntry({ ...validExpense, date: '2099-01-01' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Expense date cannot be in the future');
  });
});

// ─── validateRevenueEntry ──────────────────────────────────────────────────

describe('validateRevenueEntry()', () => {
  const validRevenue = {
    budgetId: 'budget_001',
    crop: 'maize',
    quantityKg: 500,
    pricePerKg: 2.5,
    date: '2026-07-20',
  };

  test('accepts a valid revenue entry', () => {
    const result = validateRevenueEntry(validRevenue);
    expect(result.isValid).toBe(true);
  });

  test('rejects when quantityKg is zero or negative', () => {
    const result = validateRevenueEntry({ ...validRevenue, quantityKg: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Quantity must be greater than zero');
  });

  test('rejects when pricePerKg is negative', () => {
    const result = validateRevenueEntry({ ...validRevenue, pricePerKg: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Price per kg must be greater than zero');
  });

  test('rejects when crop name is missing', () => {
    const result = validateRevenueEntry({ ...validRevenue, crop: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Crop name is required');
  });
});

// ─── validateUser ──────────────────────────────────────────────────────────

describe('validateUser()', () => {
  const validFarmer = {
    name: 'Ama Owusu',
    email: 'ama@example.com',
    phone: '+233201234567',
    role: 'farmer',
    password: 'SecurePass1!',
  };

  test('accepts a valid farmer user', () => {
    const result = validateUser(validFarmer);
    expect(result.isValid).toBe(true);
  });

  test('rejects an invalid email format', () => {
    const result = validateUser({ ...validFarmer, email: 'not-an-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  test('rejects a password shorter than 8 characters', () => {
    const result = validateUser({ ...validFarmer, password: 'Abc1!' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  test('rejects an invalid role', () => {
    const result = validateUser({ ...validFarmer, role: 'superuser' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Role must be either "farmer" or "admin"');
  });

  test('rejects when name is missing', () => {
    const result = validateUser({ ...validFarmer, name: '  ' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });
});
