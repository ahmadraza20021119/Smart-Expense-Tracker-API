const VALID_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a raw expense payload from the request body.
 * Returns { valid: true, value } or { valid: false, errors }.
 */
function validateExpenseInput(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const { title, amount, category, date } = body;

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    errors.push('category is required and must be a non-empty string');
  }

  if (typeof date !== 'string' || !VALID_DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    errors.push('date is required and must be a valid date string (YYYY-MM-DD)');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      title: title.trim(),
      amount,
      category: category.trim(),
      date,
    },
  };
}

module.exports = { validateExpenseInput };
