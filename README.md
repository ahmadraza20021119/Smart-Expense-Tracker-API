# Smart Expense Tracker API

A REST API for tracking personal expenses — add, list, filter, total, and delete expenses.
Built with Node.js and Express, with data persisted to a local JSON file (no database required).

## Tech stack

- Node.js + Express
- File-based storage (`data/expenses.json`, created automatically on first write)
- Jest + Supertest for testing

## Requirements

- Node.js 18 or later

## Install

```bash
npm install
```

## Run the server

### Locally
```bash
npm start
```

The server listens on `http://localhost:3000` by default (override with the `PORT` env var).

### With Docker
Build the Docker image:
```bash
docker build -t expense-tracker-api .
```

Run the container:
```bash
docker run -p 3000:3000 expense-tracker-api
```

By default, data written inside the container (`data/expenses.json`) does not persist
once the container is removed. To persist it on your host machine, mount a local folder
as a volume:

```bash
docker run -p 3000:3000 -v "${PWD}/data:/app/data" expense-tracker-api
```

(On Windows PowerShell, `${PWD}` resolves to your current directory; on Command Prompt, use `%cd%` instead.)

Tests run against an isolated test data file (`tests/test-data.json`) and never touch the
real `data/expenses.json`, so they're safe to run alongside a live server.

## API reference

| Method | Endpoint                          | Description                                  |
|--------|------------------------------------|-----------------------------------------------|
| GET    | `/`                                 | Welcome message + list of available endpoints |
| GET    | `/health`                          | Health check                                  |
| POST   | `/api/expenses`                    | Add an expense                                |
| GET    | `/api/expenses`                    | List all expenses                             |
| GET    | `/api/expenses?category=Food`      | List expenses filtered by category            |
| GET    | `/api/expenses/:id`                | Get a single expense                          |
| GET    | `/api/expenses/total`              | Overall total + totals broken down by category|
| GET    | `/api/expenses/total?category=Food`| Total for one category                        |
| DELETE | `/api/expenses/:id`                | Delete an expense                             |

### Expense shape

```json
{
  "id": "8b6f1e38-3504-4bbc-a823-f9dc4f0e76c0",
  "title": "Coffee",
  "amount": 150,
  "category": "Food",
  "date": "2026-07-30"
}
```

- `title`: non-empty string
- `amount`: positive number
- `category`: non-empty string (case-insensitive for filtering)
- `date`: string in `YYYY-MM-DD` format
- `id`: generated server-side (UUID v4), not supplied by the client

### Example requests

Add an expense:

```bash
curl -X POST localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Coffee","amount":150,"category":"Food","date":"2026-07-30"}'
```

List expenses in a category:

```bash
curl "localhost:3000/api/expenses?category=Food"
```

Totals:

```bash
curl localhost:3000/api/expenses/total
curl "localhost:3000/api/expenses/total?category=Food"
```

Delete an expense:

```bash
curl -X DELETE localhost:3000/api/expenses/8b6f1e38-3504-4bbc-a823-f9dc4f0e76c0
```

### Error handling

- Invalid input on `POST /api/expenses` returns `400` with an `errors` array describing
  what's wrong (missing title, non-positive amount, bad date format, etc.).
- Unknown IDs on `GET`/`DELETE` `/api/expenses/:id` return `404`.
- Malformed JSON bodies return `400` rather than crashing the server.
- Unregistered routes return `404`.

## Project structure

```
src/
  app.js               # Express app factory (used by both server.js and tests)
  server.js            # Entry point — binds the app to a port
  store.js             # Data layer: in-memory array + JSON file persistence
  validation.js        # Input validation for expense payloads
  routes/expenses.js    # Route handlers for /api/expenses
tests/
  expenses.test.js      # Integration tests (Supertest against the Express app)
```

## Notes on design choices

- **Storage**: expenses live in memory during the process, and are persisted to
  `data/expenses.json` on every write so data survives a server restart. This file is
  gitignored — it's local runtime state, not source.
- **IDs**: generated server-side with `uuid` so clients can't collide or spoof IDs.
- **Category filtering** is case-insensitive (`?category=food` matches `"Food"`), since
  users are inconsistent about casing when typing categories.
- **Route ordering**: `/api/expenses/total` is declared before `/api/expenses/:id` so
  `total` isn't swallowed by the `:id` param.
