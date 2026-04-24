# Step-by-step testing (design-overhaul) — line by line

Do the steps **in order**. Copy **one block at a time**, press **Enter**, wait for it to finish, then go to the next step.

**Words to know**

- **Project root** = the folder where you see **`frontend`**, **`backend`**, **`docs`**, and **`scripts`** together.  
- **Wrong folder** = `Agile_fin` only, or only the **first** `Grow4me-budget-design-overhaul` — there is often a **second** folder with the same name inside; you need the **inner** one.

*Plain-language “what we test and why” (no commands): see [`TESTING_OVERVIEW.md`](TESTING_OVERVIEW.md).*

---

## Part 0 — Install tools (once on your PC)

Do these outside the project if you have not already:

1. Install **Node.js** (LTS): [https://nodejs.org](https://nodejs.org)  
2. Install **Python** 3.10+ if you will run Django: [https://www.python.org](https://www.python.org)  

You do **not** repeat Part 0 every time you test.

---

## Part 1 — Open PowerShell

**Step 1.1** — Open **Windows PowerShell** (or Windows Terminal).

**Step 1.2** — Go to **project root** (use your username if it is not `HP`):

```powershell
cd "C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul"
```

**Step 1.3** — Check that you are in the right place:

```powershell
dir
```

You should see names like **`frontend`**, **`backend`**, **`docs`**, **`scripts`**.

**Step 1.4** — If you do **not** see those four folders:

- You are too high (e.g. only inside `Agile_fin`).  
- Run **Step 1.2** again and make sure the path has **`Grow4me-budget-design-overhaul` twice** in it, then run **Step 1.3** again.

---

## Part 2 — Python virtual environment (first time only, or after clone)

Stay in **project root** (Part 1).

**Step 2.1** — Go into the backend folder:

```powershell
cd backend
```

**Step 2.2** — Create a virtual environment:

```powershell
python -m venv .venv
```

**Step 2.3** — Turn the virtual environment **on** (you are inside `backend`, where `.venv` was created):

```powershell
.\.venv\Scripts\Activate.ps1
```

If Windows blocks scripts, run PowerShell **as Administrator** once, or search “execution policy” and allow scripts for your user — ask your instructor if needed.

**Step 2.4** — Install Python packages:

```powershell
pip install -r requirements.txt
```

**Step 2.5** — Go back to **project root**:

```powershell
cd ..
```

*(From `backend`, one `cd ..` lands you in project root.)*

You only repeat Part 2 when you need a fresh venv or new dependencies.

---

## Part 3 — Run all automated tests (every time, easiest way)

You must run these commands from **project root** — the folder where **`scripts`** lives next to **`frontend`** and **`backend`**.

**Not project root:** your prompt ends with `\frontend>` or `\backend>`.  
**Then** `.\scripts\run-local-tests.ps1` will **fail** with *“not recognized”* because there is **no** `scripts` folder inside `frontend`.

**Step 3.0** — Check where you are:

```powershell
dir
```

If you do **not** see a folder named **`scripts`**, go up to project root:

```powershell
cd ..
```

Run `dir` again until you see **`scripts`**, **`frontend`**, **`backend`**, **`docs`**.

**Step 3.1** — Run the full test script (frontend + Jest + Django):

```powershell
.\scripts\run-local-tests.ps1
```

**Step 3.2** — If **PostgreSQL / Django** is not set up on your machine yet, use this instead (skips Django):

```powershell
.\scripts\run-local-tests.ps1 -SkipBackend
```

**Step 3.3** — If PowerShell says it **cannot run scripts**, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local-tests.ps1 -SkipBackend
```

**What Part 3 runs (in plain language)**

| Order | What runs | What it checks |
|------|-----------|----------------|
| 1 | `npm run lint:automation` in `frontend/` | ESLint on **`src/lib`** and **`src/test`** only (so the script is not blocked by legacy `any` in pages). |
| 2 | `npm run test` in `frontend/` | Vitest — small tests under `src/lib/`. |
| 3 | `npm run build` in `frontend/` | The app still **builds**. |
| 4 | `npm test` in `docs/sprint-1/tdd/` | Jest — budget calculator / summary / validator. |
| 5 | `manage.py test` | Django tests (skipped if you used `-SkipBackend`). |

**Full-repo lint:** from `frontend/`, run `npm run lint` when you are ready to fix issues across the whole app (that command may report 100+ errors today).

**If you skip lint entirely** but still want tests and build, use **Part 4** below and **skip** Step 4.3.

---

## Part 4 — Same tests without the big script (line by line)

Use this when you prefer **manual control**, or when **lint** stops the script but you still want tests + build.

Always start from **project root** (Part 1).

### Frontend — run each line, wait, then the next

**Step 4.1**

```powershell
cd frontend
```

**Step 4.2**

```powershell
npm install
```

**Step 4.3** — Lint only the folders the automation script checks (recommended):

```powershell
npm run lint:automation
```

**Step 4.3b** (optional — whole frontend; often many errors today)

```powershell
npm run lint
```

**Step 4.4**

```powershell
npm run test
```

**Step 4.5**

```powershell
npm run build
```

**Step 4.6** — Back to project root:

```powershell
cd ..
```

### Jest (course TDD folder) — line by line

**Step 4.7**

```powershell
cd docs\sprint-1\tdd
```

**Step 4.8**

```powershell
npm install
```

**Step 4.9**

```powershell
npm test
```

**Step 4.10** — Back to project root:

```powershell
cd ..\..\..
```

### Django — line by line (only if DB + venv work)

**Step 4.11** — Turn on venv if it is not already on (from project root):

```powershell
cd backend
```

**Step 4.12**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Step 4.13**

```powershell
cd grow4me_budget_app
```

**Step 4.14**

```powershell
python manage.py test
```

**Step 4.15** — Leave Django folder and venv as you like:

```powershell
cd ..\..
```

---

## Part 5 — Run the app in the browser (manual “click” testing)

Use **two** PowerShell windows. Both should start with **Part 1** (project root), or you `cd` there once per window.

### Window A — API server

**Step 5.1**

```powershell
cd "C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul"
```

**Step 5.2**

```powershell
cd backend
```

**Step 5.3**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Step 5.4**

```powershell
cd grow4me_budget_app
```

**Step 5.5**

```powershell
python manage.py runserver
```

Leave this window **open**.

### Window B — web app

**Step 5.6** — New window, then:

```powershell
cd "C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul"
```

**Step 5.7**

```powershell
cd frontend
```

**Step 5.8**

```powershell
npm run dev
```

**Step 5.9** — In your browser, open the address Vite prints (often `http://localhost:5173`).

**Step 5.10** — Click through the app using the product checklist:  
[`docs/sprint-1/feature-vertical-slice.md`](../sprint-1/feature-vertical-slice.md)

---

## Part 6 — Two testers (optional)

Same as Part 3, but split:

| Person | After Part 1, run |
|--------|-------------------|
| Tester A | `.\scripts\run-tester-a-frontend.ps1` |
| Tester B | `.\scripts\run-tester-b-tdd-backend.ps1` or `.\scripts\run-tester-b-tdd-backend.ps1 -SkipBackend` |

More detail: [`TESTING_TWO_TESTERS.md`](TESTING_TWO_TESTERS.md).

---

## Part 7 — Before a demo (short checklist)

1. Part 1 → project root.  
2. Part 3 (or Part 4 line by line).  
3. Part 5 — open app and smoke-test the screens you will show.

**After a run:** copy pass/fail counts into [`TEST_RESULTS.md`](TEST_RESULTS.md) so the team has a dated record.

---

## If something goes wrong

| What you see | What to do |
|--------------|------------|
| `Cannot find path ... \Agile_fin\backend` | You are not in project root. Do **Part 1** again; path must include **`Grow4me-budget-design-overhaul` twice**. |
| `run-local-tests.ps1` is **not recognized** (from `...\frontend>`) | You are inside **`frontend`**. Run **`cd ..`**, confirm **`dir`** shows **`scripts`**, then run **`.\scripts\run-local-tests.ps1`** again. See **Part 3 — Step 3.0**. |
| `npm` is not recognized | Install Node.js, close and reopen PowerShell. |
| `python` is not recognized | Install Python, or use `py` instead of `python` in the commands. |
| `No module named django` | Do **Part 2** and make sure **Step 2.3** (Activate) ran before `pip install` and before `manage.py`. |
| `npm run lint` shows 100+ errors | Expected on full app today. Scripts use **`npm run lint:automation`** instead. For manual runs, use **Step 4.3** (not 4.3b), or skip lint and run **4.4** + **4.5**. |
| Django cannot connect to database | Use `.\scripts\run-local-tests.ps1 -SkipBackend` or **Part 4** only through **4.10**; fix Postgres with your team. |

---

## Related files

| File | Purpose |
|------|---------|
| [`scripts/run-local-tests.ps1`](../../scripts/run-local-tests.ps1) | One script for frontend + Jest + Django |
| [`scripts/run-tester-a-frontend.ps1`](../../scripts/run-tester-a-frontend.ps1) | Frontend only |
| [`scripts/run-tester-b-tdd-backend.ps1`](../../scripts/run-tester-b-tdd-backend.ps1) | Jest + Django |
| [`TESTING_TWO_TESTERS.md`](TESTING_TWO_TESTERS.md) | Who runs which script |
| [`TEST_RESULTS.md`](TEST_RESULTS.md) | Log of test run outcomes (template + example) |
