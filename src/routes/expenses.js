const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateExpenseInput } = require('../validation');

function createExpensesRouter(store) {
  const router = express.Router();

  // GET /api/expenses?category=food -> list all (optionally filtered)
  router.get('/', (req, res) => {
    const { category } = req.query;
    const expenses = store.getAll(category);
    res.json({ count: expenses.length, expenses });
  });

  // GET /api/expenses/total?category=food -> overall or per-category total
  // Must be declared before "/:id" so "total" isn't parsed as an id.
  router.get('/total', (req, res) => {
    const { category } = req.query;
    if (category) {
      return res.json({ category, total: store.getTotal(category) });
    }
    res.json({
      overallTotal: store.getTotal(),
      totalsByCategory: store.getTotalsByCategory(),
    });
  });

  // POST /api/expenses -> add an expense
  router.post('/', (req, res) => {
    const result = validateExpenseInput(req.body);
    if (!result.valid) {
      return res.status(400).json({ errors: result.errors });
    }
    const expense = { id: uuidv4(), ...result.value };
    store.add(expense);
    res.status(201).json(expense);
  });

  // GET /api/expenses/:id -> single expense
  router.get('/:id', (req, res) => {
    const expense = store.getById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  });

  // DELETE /api/expenses/:id -> delete an expense
  router.delete('/:id', (req, res) => {
    const deleted = store.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(204).send();
  });

  return router;
}

module.exports = { createExpensesRouter };
