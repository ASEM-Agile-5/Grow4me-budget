/**
 * Input Validator
 * Validates all data entering the Farm Budget system before persistence.
 */

const VALID_EXPENSE_CATEGORIES = ['seeds', 'fertilizer', 'labor', 'equipment', 'transport', 'other'];
const VALID_ROLES = ['farmer', 'admin'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidDate(dateStr) {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function isFutureDate(dateStr) {
  return new Date(dateStr) > new Date();
}

function validateBudgetEntry(entry) {
  const errors = [];
  if (!entry.title || entry.title.trim() === '') errors.push('Title is required');
  if (!entry.farmerId)                             errors.push('Farmer ID is required');
  if (!entry.season || entry.season.trim() === '') errors.push('Season is required');
  if (typeof entry.targetRevenue !== 'number' || entry.targetRevenue <= 0) {
    errors.push('Target revenue must be a positive number');
  }
  return { isValid: errors.length === 0, errors };
}

function validateExpenseEntry(entry) {
  const errors = [];
  if (!entry.budgetId || entry.budgetId.trim() === '') {
    errors.push('Budget ID is required');
  }
  if (!VALID_EXPENSE_CATEGORIES.includes(entry.category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}`);
  }
  if (typeof entry.amount !== 'number' || entry.amount <= 0) {
    errors.push('Amount must be greater than zero');
  }
  if (!isValidDate(entry.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  } else if (isFutureDate(entry.date)) {
    errors.push('Expense date cannot be in the future');
  }
  return { isValid: errors.length === 0, errors };
}

function validateRevenueEntry(entry) {
  const errors = [];
  if (!entry.budgetId) errors.push('Budget ID is required');
  if (!entry.crop || entry.crop.trim() === '') errors.push('Crop name is required');
  if (typeof entry.quantityKg !== 'number' || entry.quantityKg <= 0) {
    errors.push('Quantity must be greater than zero');
  }
  if (typeof entry.pricePerKg !== 'number' || entry.pricePerKg <= 0) {
    errors.push('Price per kg must be greater than zero');
  }
  return { isValid: errors.length === 0, errors };
}

function validateUser(user) {
  const errors = [];
  if (!user.name || user.name.trim() === '') errors.push('Name is required');
  if (!EMAIL_REGEX.test(user.email))          errors.push('Invalid email format');
  if (!user.password || user.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!VALID_ROLES.includes(user.role)) {
    errors.push('Role must be either "farmer" or "admin"');
  }
  return { isValid: errors.length === 0, errors };
}

module.exports = { validateBudgetEntry, validateExpenseEntry, validateRevenueEntry, validateUser };
