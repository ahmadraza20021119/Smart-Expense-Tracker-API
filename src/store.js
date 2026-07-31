const fs = require('fs');
const path = require('path');

// Where we persist data on disk. Can be overridden (tests point this at a
// throwaway file so they never touch real data).
const DATA_FILE =
  process.env.EXPENSES_DATA_FILE || path.join(__dirname, '..', 'data', 'expenses.json');

class ExpenseStore {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath;
    this.expenses = [];
    this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      this.expenses = JSON.parse(raw);
    } catch (err) {
      // No file yet (first run) or unreadable — start empty rather than crash.
      this.expenses = [];
    }
  }

  _save() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.expenses, null, 2));
  }

  getAll(category) {
    if (category) {
      const normalized = category.toLowerCase();
      return this.expenses.filter((e) => e.category.toLowerCase() === normalized);
    }
    return [...this.expenses];
  }

  getById(id) {
    return this.expenses.find((e) => e.id === id);
  }

  add(expense) {
    this.expenses.push(expense);
    this._save();
    return expense;
  }

  delete(id) {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.expenses.splice(index, 1);
    this._save();
    return true;
  }

  getTotal(category) {
    const relevant = category ? this.getAll(category) : this.expenses;
    return relevant.reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalsByCategory() {
    const totals = {};
    for (const e of this.expenses) {
      const key = e.category;
      totals[key] = (totals[key] || 0) + e.amount;
    }
    return totals;
  }

  clear() {
    this.expenses = [];
    this._save();
  }
}

module.exports = { ExpenseStore, DATA_FILE };
