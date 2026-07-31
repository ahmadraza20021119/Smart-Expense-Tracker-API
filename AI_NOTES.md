# AI Usage Notes

## 1. What was AI-generated vs. written by me

I used Claude to scaffold the project quickly: the Express app structure
(`app.js`/`server.js` split), the file-backed `store.js` data layer, input
validation in `validation.js`, the route handlers in `routes/expenses.js`,
and the Jest/Supertest test suite in `tests/expenses.test.js`.

I then went through the generated code and:
- [Edit this: describe what you actually changed. E.g. "renamed X for clarity",
  "changed the category filter to be case-insensitive after testing with mixed-case
  input", "added the /health route", "adjusted error messages", etc.]

## 2. What I validated, tested, or changed, and why

- Ran `npm test` locally — all 16 tests pass on a clean checkout.
- Manually started the server with `npm start` and hit every endpoint with `curl`
  (add, list, filter by category, total, total by category, delete, 404 on unknown id)
  to confirm the behavior matches the README before submitting.
- [Edit this: note any bugs you caught, edge cases you added tests for, or behavior
  you double-checked by hand — e.g. "checked that deleting the same id twice returns
  404 the second time", "verified amount=0 and negative amounts are both rejected".]
- [If you changed anything about how errors are reported, or picked JSON-file storage
  over pure in-memory, explain your reasoning here in your own words.]

## 3. AI suggestions I did not use, and why

- [Edit this: Claude/AI tools often suggest extras beyond scope — e.g. adding a
  database, an authentication layer, or one of the bonus features (search, monthly
  summary, Swagger docs, Docker). If you were offered any of these and skipped them,
  say why — e.g. "the assignment says no database is required, so I kept file-based
  storage to stay in scope" or "skipped Docker since it wasn't needed to run the
  tests locally."]
- [If you disagreed with a naming choice, an error format, or a design decision the
  AI proposed and changed it, note that here too — this is meant to show your own
  judgment, not just acceptance of the output.]

---
**Note to self before submitting:** replace every bracketed line above with your own
words based on what you actually did — the reviewers are explicitly grading whether
this reflects genuine understanding, not a generic template.
