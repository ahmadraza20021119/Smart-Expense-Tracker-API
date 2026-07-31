const express = require('express');
const { ExpenseStore } = require('./store');
const { createExpensesRouter } = require('./routes/expenses');

/**
 * Builds an Express app wired to the given store (or a default file-backed
 * one). Kept separate from server.js so tests can create an app instance
 * without binding to a port.
 */
function createApp(store = new ExpenseStore()) {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Smart Expense Tracker API',
      endpoints: {
        health: '/health',
        expenses: '/api/expenses',
        totals: '/api/expenses/total'
      }
    });
  });

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/expenses', createExpensesRouter(store));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler (e.g. malformed JSON bodies)
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON in request body' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
