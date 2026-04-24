# Test results log (design-overhaul)

Use this file to **record outcomes** after you run `.\scripts\run-local-tests.ps1` (or the split Tester A / B scripts). Paste a short summary or attach CI logs in your team channel if needed.

**How to update:** copy the **Template** section for each new run, fill in the date and outcomes, then save.

---

## Template — copy below for each new run

```markdown
### Run — YYYY-MM-DD HH:MM

| Field | Value |
|-------|--------|
| **Machine / OS** | |
| **Branch / commit** | |
| **Command** | e.g. `.\scripts\run-local-tests.ps1 -SkipBackend` |
| **Outcome** | PASS / FAIL |

| Step | Tool | Result | Notes |
|------|------|--------|-------|
| Lint (scoped) | `npm run lint:automation` | | |
| Frontend unit tests | Vitest | | e.g. 13 passed |
| Production build | `vite build` | | |
| TDD (Jest) | `docs/sprint-1/tdd` | | e.g. 61 passed |
| Django | `manage.py test` | SKIPPED / PASS / FAIL | |

**Failures (if any):** paste error summary or file paths here.

---
```

---

## Recorded run — 2026-04-23 (actual terminal output)

| Field | Value |
|-------|--------|
| **When** | Run completed successfully (Vitest “Start at” `22:31:59` local) |
| **Command** | `.\scripts\run-local-tests.ps1 -SkipBackend` |
| **Working directory** | `C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul` (venv active: `(.venv)`) |
| **Outcome** | **PASS** (Django skipped on purpose) |

| Step | Tool | Result | Details |
|------|------|--------|---------|
| Dependencies | `frontend` | OK | No install needed (silent) |
| Lint (scoped) | `npm run lint:automation` | **PASS** | `eslint src/lib src/test --max-warnings 0` |
| Frontend unit tests | Vitest v3.2.4 | **PASS** | 3 files, **13** tests; duration **11.98s** |
| Production build | Vite v5.4.21 | **PASS** | `✓ built in 16.60s`; 500 kB chunk **warning** only |
| TDD (Jest) | Jest `--coverage` | **PASS** | 3 suites, **61** tests; **4.631 s**; coverage table below |
| Django | `manage.py test` | **SKIPPED** | `Skipped backend tests (-SkipBackend).` |

**Jest coverage (from report)**

| File | % Stmts | % Branch | % Funcs | % Lines |
|------|---------|----------|---------|---------|
| All files | 98 | 96.59 | 100 | 100 |
| `budgetCalculator.js` | 97.05 | 95.45 | 100 | 100 |
| `budgetSummary.js` | 100 | 90 | 100 | 100 |
| `inputValidator.js` | 98.07 | 98.21 | 100 | 100 |

**Vitest files (from report)**

- `src/lib/query-cache.test.ts` — 4 tests  
- `src/lib/offline-queue.test.ts` — 6 tests  
- `src/lib/utils.test.ts` — 3 tests  

**Full console output (verbatim)**

```text
PS C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul> .\scripts\run-local-tests.ps1 -SkipBackend
Project root: C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul

=== Frontend (1/4) - dependencies ===


=== Frontend (2/4) - lint (src/lib + src/test; full app: npm run lint) ===


> vite_react_shadcn_ts@0.0.0 lint:automation
> eslint src/lib src/test --max-warnings 0


=== Frontend (3/4) - unit tests (Vitest) ===


> vite_react_shadcn_ts@0.0.0 test
> vitest run


 RUN  v3.2.4 C:/Users/HP/Downloads/Agile_fin/Grow4me-budget-design-overhaul/Grow4me-budget-design-overhaul/frontend

 ✓ src/lib/query-cache.test.ts (4 tests) 17ms
 ✓ src/lib/offline-queue.test.ts (6 tests) 17ms
 ✓ src/lib/utils.test.ts (3 tests) 15ms

 Test Files  3 passed (3)
      Tests  13 passed (13)
   Start at  22:31:59
   Duration  11.98s (transform 4.22s, setup 13.53s, collect 630ms, tests 49ms, environment
12.44s, prepare 7.21s)


=== Frontend (4/4) - production build ===


> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 1743 modules transformed.
dist/index.html                   1.84 kB │ gzip:   0.77 kB
dist/assets/index-B7_dzzsz.css   75.34 kB │ gzip:  13.65 kB
dist/assets/index-B9n5Ky1h.js   500.40 kB │ gzip: 148.86 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 16.60s

=== TDD contract - docs/sprint-1/tdd (Jest + coverage) ===

npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not
use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely
publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

added 266 packages, and audited 267 packages in 27s

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

> growforme-farm-budget-tdd@0.1.0 test
> jest --coverage

 PASS  tests/budgetCalculator.test.js
 PASS  tests/budgetSummary.test.js
 PASS  tests/inputValidator.test.js
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |      98 |    96.59 |     100 |     100 |
 budgetCalculator.js |   97.05 |    95.45 |     100 |     100 | 15
 budgetSummary.js    |     100 |       90 |     100 |     100 | 30
 inputValidator.js   |   98.07 |    98.21 |     100 |     100 | 53
---------------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        4.631 s
Ran all test suites.

Skipped backend tests (-SkipBackend).

All requested steps completed successfully.
Next: start backend (if used):  cd backend\grow4me_budget_app ; python manage.py runserver
        start frontend:           cd frontend ; npm run dev

(.venv) PS C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul>
```

**Notes**

- `npm warn deprecated` under the TDD `npm install` step comes from **old transitive packages** (e.g. `glob`); it is **not** a test failure.  
- Chunk **> 500 kB** message is a **build performance hint**, not an error.  
- To log **Django** results, run the same command **without** `-SkipBackend` when the database is ready, and append a new section below.

---

## Run — 2026-04-23 — Playwright E2E only (not a full `run-local-tests` re-run)

| Field | Value |
|-------|--------|
| **When** | After adding `frontend/e2e/` smoke tests and `npm run test:e2e` (Playwright v1.57) |
| **Command(s)** | One-time: `npx playwright install chromium` in `frontend/`; then `npm run test:e2e` |
| **Working directory** | `C:\Users\HP\Downloads\Agile_fin\Grow4me-budget-design-overhaul\Grow4me-budget-design-overhaul\frontend` |
| **Outcome** | **PASS** — 3 E2E tests, Chromium, dev server started by Playwright (`http://127.0.0.1:8080`) |

| Step | Tool | Result | Notes |
|------|------|--------|--------|
| Browser install (first machine) | `npx playwright install chromium` | **PASS** | Exit code `0`; Chrome for Testing, FFmpeg, Headless Shell, winldd downloaded to `%LOCALAPPDATA%\ms-playwright\` (progress output omitted; run was ~6 min on this network) |
| E2E | `npm run test:e2e` | **PASS** | 3 passed in **11.4s**; see verbatim console block below |
| Vitest / lint / build / Jest TDD / Django | — | **Not re-run** | Prior run is in the **Recorded run — 2026-04-23** section above |

**Spec file:** `frontend/e2e/smoke.spec.ts` (login page copy, unauthenticated redirect `/` → `/login`, 404 page).

**Full console output — `npm run test:e2e` (verbatim, passing run)** 

```text
> vite_react_shadcn_ts@0.0.0 test:e2e
> playwright test


Running 3 tests using 3 workers

(node:12544) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:17008) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:16832) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:17008) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:12544) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:16832) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok 2 [chromium] › e2e\smoke.spec.ts:3:1 › login page shows sign-in (1.8s)
  ok 3 [chromium] › e2e\smoke.spec.ts:16:1 › unknown path shows 404 (1.6s)
  ok 1 [chromium] › e2e\smoke.spec.ts:10:1 › root without session redirects to login (2.6s)

  3 passed (11.4s)
```

---

## Related

- Plain summary of what we test and which tools: [`TESTING_OVERVIEW.md`](TESTING_OVERVIEW.md)  
- How to run tests: [`TESTING_STEP_BY_STEP.md`](TESTING_STEP_BY_STEP.md)  
- Two-person split: [`TESTING_TWO_TESTERS.md`](TESTING_TWO_TESTERS.md)
