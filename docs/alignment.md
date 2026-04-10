# Documentation alignment — Farm Budget team

This file is the **single place** where we resolve differences between the **course brief** (ASEM / ICS 532), the **Definition of Done**, the **vertical-slice product doc** (FarmBudget SPA), and the **Jest TDD contract** in `docs/sprint-1/tdd/`. If anything disagrees, **this document wins** for interpretation; then update the other artifact in the same sprint.

---

## 1. Architecture over time (no contradictions)


| Phase                             | When (course weeks) | What we ship                                                                                                                                                  | Implication for “done”                                                                                                                                                                |
| --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Vertical slice**            | Sprint 1            | React + TypeScript SPA, client-side state (`BudgetContext`), mock/seed data, no production API ([feature-vertical-slice](sprint-1/feature-vertical-slice.md)) | “End-to-end” means **browser routes + context + UI + validation (Zod)** for the slice. There is **no** backend or DB to integrate yet.                                                |
| **B — Integration & UX**          | Sprint 2            | External services (e.g. maps/payment mocks), responsive UI from designs, refactoring                                                                          | DoD’s integration criteria apply to **third-party mocks + UI**, not necessarily REST yet.                                                                                             |
| **C — Backend, DevOps, security** | Sprints 3–4         | CI/CD, deployment, monitoring; course also expects RBAC, PWA, API-first patterns for Farm Budget                                                              | **OpenAPI**, **RBAC**, **PWA**, and **PostgreSQL** (or chosen stack) apply when that code exists. Until then, those checklist items are **planned / N/A** and tracked on the backlog. |


So: the vertical slice doc is **accurate for Sprint 1**. The course PDF describes the **full** Farm Budget module including global standards by project end—not all of Sprint 1.

---

## 2. Testing: Vitest (app) vs Jest (`docs/sprint-1/tdd`)


| Artifact                                           | Role                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest + Playwright** in the FarmBudget app repo | Primary tests for React components, hooks, and pages (per vertical-slice doc).                                                                                                                                                                                                     |
| **Jest suite** in `docs/sprint-1/tdd/`             | **Contract / specification** for **critical financial behaviour**: totals, profit, ROI, summary object shape, and minimal validation rules. Written for clarity and course “TDD on calculations”; logic should stay **in sync** with any `src/lib` or shared package the app uses. |


**Not a clash:** two layers. The DoD “≥ 80% coverage on business logic” applies to **where that logic lives** (shared module or app). The Jest package proves the **numerical contract** early and can run in CI alongside `pnpm test` in the app.

---

## 3. Validation categories (Zod vs Jest validator)

The vertical slice lists expense categories such as `Seeds`, `Fertilizer`, `Feed`, `Vet/Medicine`, `Pesticides`, etc. The Jest `inputValidator.js` uses a **short allowlist** for teaching and regression tests. **Product truth** for allowed categories is:

- **UI + Zod schemas** in the FarmBudget app (must match [feature-vertical-slice](sprint-1/feature-vertical-slice.md)).

When you add a category in the app, either extend the Jest validator/tests in lockstep or extract **one shared** `categories.ts` / package used by both.

---

## 4. Health / status labels


| Layer                             | Labels                                                             | Notes                          |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| **UI** (budget items)             | On Track / Near Limit / Exceeded (utilisation)                     | Defined in vertical-slice doc. |
| **Jest** `categorizeBudgetHealth` | Healthy / Moderate / At Risk / Loss (profit **margin** vs revenue) | Used in summary/ROI reporting. |


Different dimensions (spend vs plan **vs** profit margin). Both can coexist; name them clearly in dashboards and reports so users are not confused.

---

## 5. Currency and locale

Vertical slice: **GHS** via `toLocaleString()`. Jest tests use **plain numbers** (no currency) as the numerical contract. Formatting is a **presentation** concern in the app.

---

## 6. Scrum Master / backlog tip

When writing user stories, tag them with **phase A/B/C** above so the team does not block Sprint 1 on OpenAPI or RBAC unless that story is explicitly a spike or stretch goal.

---

**Last updated:** Documentation restructure (Sprint 0–1 artifacts under `docs/`).