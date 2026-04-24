# Testing split for two testers (design-overhaul repo)

For a **single linear checklist** (prerequisites → automated → manual → smoke), see **[`TESTING_STEP_BY_STEP.md`](TESTING_STEP_BY_STEP.md)**.

Use this when **two people** share testing: one focuses on the **SPA / frontend pipeline**, the other on the **financial TDD contract and Django API layer**. Work on the **same branch** and paste results (pass/fail + screenshots or CI logs) into your team channel or sprint notes before review.

**Project root** (for all commands): the folder that contains `frontend/`, `backend/`, and `docs/`.

```text
Grow4me-budget-design-overhaul/
```

---

## Quick reference

| Who | Script | What it runs | What it validates |
|-----|--------|--------------|-------------------|
| **Tester A** | `.\scripts\run-tester-a-frontend.ps1` | `npm install` (if needed), `npm run lint:automation`, `npm run test`, `npm run build` in `frontend/` | ESLint on **`src/lib` + `src/test`**, **Vitest** (`src/lib/*.test.ts`), production build (`npm run lint` = whole app, may fail) |
| **Tester B** | `.\scripts\run-tester-b-tdd-backend.ps1` | `npm install` (if needed), `npm test` in `docs/sprint-1/tdd`, then `manage.py test` | Jest + coverage gates; **Django**: `budget.tests` (category serializer/model), `members.tests` (user manager) |
| **Either (full sweep)** | `.\scripts\run-local-tests.ps1` | A + B in one go | Same as both scripts combined |
| **Tester B (no DB yet)** | `.\scripts\run-tester-b-tdd-backend.ps1 -SkipBackend` | Jest only | Skips Django until DB/env is ready |

---

## Tester A — Frontend & SPA quality

### Your focus

- Automated **lint, unit tests, and build** for the React (Vite + TypeScript) app.
- **Manual / exploratory** testing of **UI flows, layout, responsiveness, and accessibility** (pair with `docs/sprint-1/feature-vertical-slice.md`).

### Script to run

From PowerShell, at **project root**:

```powershell
cd "C:\path\to\Grow4me-budget-design-overhaul"
.\scripts\run-tester-a-frontend.ps1
```

If policy blocks scripts:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-tester-a-frontend.ps1
```

### What `run-tester-a-frontend.ps1` is testing

| Step | Command (inside script) | Purpose |
|------|-------------------------|--------|
| Dependencies | `npm install` in `frontend/` (only if `node_modules` missing) | Ensures tooling and deps match `package.json`. |
| Lint (automation) | `npm run lint:automation` | **ESLint** on `src/lib` and `src/test` only. Use `npm run lint` for the full frontend when cleaning tech debt. |
| Unit tests | `npm run test` | **Vitest** — `src/lib/utils.test.ts`, `query-cache.test.ts`, `offline-queue.test.ts` (plus any future `src/**/*.test.ts`). |
| Build | `npm run build` | **Vite production build** — TypeScript compile, bundle; catches errors dev server might not show. |

### Manual checks (Tester A owns documenting results)

- Run the app: `cd frontend` → `npm run dev` (with backend running if the UI calls APIs).
- Exercise: navigation, Dashboard, Budgets, Create Budget (templates / historical / text), Expenses, Revenue, Reports, Login/settings as applicable.
- Resize window or use device mode: **mobile vs desktop** layout.
- Optional: **PWA / offline** behaviour if enabled (`public/sw.js`, offline page).

---

## Tester B — Financial TDD contract & backend

### Your focus

- **Course TDD suite** for **critical budget math and validation** (Jest in `docs/sprint-1/tdd`).
- **Django** automated tests and **API / integration** behaviour (when the environment is ready).

### Script to run

From PowerShell, at **project root**:

```powershell
cd "C:\path\to\Grow4me-budget-design-overhaul"
.\scripts\run-tester-b-tdd-backend.ps1
```

If PostgreSQL / env is **not** configured yet, run Jest only:

```powershell
.\scripts\run-tester-b-tdd-backend.ps1 -SkipBackend
```

If policy blocks:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-tester-b-tdd-backend.ps1 -SkipBackend
```

### What `run-tester-b-tdd-backend.ps1` is testing

| Step | Command (inside script) | Purpose |
|------|-------------------------|--------|
| TDD install | `npm install` in `docs/sprint-1/tdd` if needed | Locks Jest deps for the contract suite. |
| TDD tests | `npm test` → **Jest** with `--coverage` | Runs `budgetCalculator`, `budgetSummary`, `inputValidator` tests; **coverage thresholds** (see that folder’s `package.json`). |
| Django tests | `python manage.py test` from `backend/grow4me_budget_app` | Runs `budget/tests.py`, `members/tests.py`, `project/tests.py`, etc. Uses `backend\.venv\Scripts\python.exe` if that path exists. |

### Manual checks (Tester B owns documenting results)

- Start API: `cd backend\grow4me_budget_app` → `python manage.py runserver`.
- Use browser **Network** tab or Postman: auth, budget CRUD, error responses.
- If applicable: **Lite** SMS/expense flows; **AI parse** endpoint behaviour and failure modes (quota, empty body).

---

## Coordination (both testers)

1. **Before testing:** pull latest, agree on branch, note any required `.env` / secrets.
2. **Run in parallel:** Tester A runs `run-tester-a-frontend.ps1`, Tester B runs `run-tester-b-tdd-backend.ps1` (or `-SkipBackend` until DB is ready).
3. **Before demo / PR:** one person runs the **full** script once to confirm nothing regressed:

   ```powershell
   .\scripts\run-local-tests.ps1
   ```

   Or without Django:

   ```powershell
   .\scripts\run-local-tests.ps1 -SkipBackend
   ```

4. **Share evidence:** paste exit codes, failing test names, or screenshots; file bugs with steps to reproduce.

---

## File map

| File | Role |
|------|------|
| `scripts/run-tester-a-frontend.ps1` | Tester A automation |
| `scripts/run-tester-b-tdd-backend.ps1` | Tester B automation |
| `scripts/run-local-tests.ps1` | Full pipeline (A + B) |
| `docs/sprint-1/tdd/` | Jest TDD source + tests |
| `frontend/` | Vitest + ESLint + Vite build |
| `backend/grow4me_budget_app/manage.py` | Django entry for `manage.py test` |

---

## No PowerShell?

Run the same steps manually:

**Tester A** — in `frontend/`: `npm install`, `npm run lint:automation`, `npm run test`, `npm run build` (or `npm run lint` for full-app ESLint).

**Tester B** — in `docs/sprint-1/tdd/`: `npm install`, `npm test`; then in `backend/grow4me_budget_app/`: `python manage.py test`.
