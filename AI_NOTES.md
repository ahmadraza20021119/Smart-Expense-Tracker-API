# AI Usage Notes

## 1. What was AI-generated vs. written by me

I used Claude to scaffold the basic structure of the project. I then wrote and customized the routes API (in `routes/expenses.js`), the server configuration, the Docker setup (`Dockerfile` and `.dockerignore`), and other parts of the application code myself.

My work also included the validation and testing phase described below , wrote the code and then went to check it by making sure the code actually does what the assignment asked for, and making sure everything runs correctly on my machine (both locally and inside the Docker container).

## 2. What I validated, tested, or changed, and why

- Ran `npm test` — all 16 automated tests pass on a clean checkout.
- Started the server with `npm start` and manually exercised every required
  feature from the assignment spec with `curl`, one at a time:
  - Added expenses (Tea, Coffee) and confirmed each got a server-generated id
  - Listed all expenses and confirmed the response shape (`count` + `expenses` array)
  - Filtered by `?category=Food` and confirmed it returned only matching items
  - Checked `/api/expenses/total` and confirmed both the overall total and the
    per-category breakdown matched what I'd added
  - Deleted an expense and re-fetched the list to confirm it was actually gone
  - Hit an unknown id on GET/DELETE and confirmed a 404 came back instead of a crash
- Ran into a real environment issue while testing on Windows: PowerShell aliases
  `curl` to `Invoke-WebRequest`, which doesn't support the `-X` flag the AI's
  example commands assumed. I had to switch to `curl.exe` (the real curl binary)
  to run POST/DELETE requests. I also found PowerShell's quote-escaping unreliable
  for inline JSON in `-d` — writing the JSON body to a file and passing `-d "@file.json"`
  was the fix that actually worked. I did not take the AI's example curl commands
  at face value — I ran them, hit real shell-specific failures, and worked out the
  fix myself.
- Confirmed `data/expenses.json` and `node_modules/` are excluded by `.gitignore`
  and don't end up committed to the repo.

## 3. AI suggestions I did not use, and why

- Kept the file-backed store rather than adding a database, since the assignment
  said no database was required.
- Implemented Docker as the one bonus feature. I built the image, ran it locally,
  hit a real port-conflict issue (a leftover `npm start` process and an old
  container both holding port 3000), diagnosed it with `netstat`/`docker ps`,
  and confirmed the container serves requests identically to `npm start` before
  committing the Docker files.
- Skipped the other bonus options (search, monthly summary, Swagger) since the
  assignment allows only one and I prioritized getting Docker fully verified.