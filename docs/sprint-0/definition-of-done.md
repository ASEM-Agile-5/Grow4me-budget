# GrowForMe – Farm Budget Project

## Team Definition of Done (DoD)

**Sprint 0 Artifact | ICS 532 Agile Software Engineering Methods**

---

## What Is the Definition of Done?

The Definition of Done (DoD) is a shared, team-agreed checklist that every **User Story**, **Sprint**, and the **Final Product** must satisfy before it is considered complete. It is not a list of acceptance criteria for individual features—it is the quality standard that applies *uniformly* to all work the team ships.

> **Scrum principle:** Nothing is "done" unless it meets the DoD. Partial work has zero value to the product.

---

## Product phases (read with `docs/alignment.md`)

The **Farm Budget** deliverable evolves from a **client-only vertical slice** (Sprint 1) toward **APIs, RBAC, PWA, and deployment** (later sprints), per ICS 532 / GrowForMe. Apply the checklist below **for the phase your story belongs to**. Items marked **(later)** apply only once that capability is in scope.

| Phase | What “done” means for integration |
|--------|-----------------------------------|
| **Sprint 1 — Vertical slice** | Feature works end-to-end **in the SPA**: routing, `BudgetContext`, Zod validation, and UI per [`sprint-1/feature-vertical-slice.md`](../sprint-1/feature-vertical-slice.md). |
| **Sprint 2+** | Add real integrations (designed APIs, external mocks, responsive/Figma UI) as per sprint goals. |
| **Final product** | Backend, OpenAPI, RBAC, PWA, and cloud deployment as required by the course brief. |

---

## DoD Level 1: User Story Done

A User Story is considered **Done** when ALL of the following are true:

### Functional Completeness

- All acceptance criteria defined in the user story are met and verified
- The feature works end-to-end **for its current architecture**: for the Sprint 1 SPA, that means **UI → client state → validation (Zod)** on supported routes; once a backend exists, include **API → persistence** where applicable
- Edge cases and invalid inputs are handled gracefully (no crashes, meaningful error messages)

### Test Coverage

- Unit tests exist and pass for all new business logic (minimum 80% code coverage for that module)
- Tests were written **before** or **alongside** the implementation (TDD approach for critical components)
- No existing tests have been broken (full test suite passes)

### Code Quality

- Code has been reviewed and approved by at least one other team member via a Pull Request
- Code follows the team's agreed style guide (ESLint / Prettier rules pass with zero errors)
- No hardcoded secrets, credentials, or environment-specific values in the codebase
- No TODO comments left in production code (use GitHub Issues instead)

### Integration

- Feature branch has been merged into `main` with no merge conflicts
- CI pipeline (GitHub Actions) has run and all checks pass (lint → test → build)
- The feature does not break any other existing feature (regression check done)

### Documentation

- Any new **REST API** endpoint is documented (OpenAPI or equivalent) **(later — when APIs exist)**; for Sprint 1, document non-obvious **client routes and context actions** in the app README or `docs/sprint-1/feature-vertical-slice.md` updates
- Any complex logic includes a brief inline comment explaining *why*, not *what*
- The Jira/Trello card is updated to reflect actual story points and moved to "Done"

### UX & Accessibility

- UI is responsive (tested on mobile viewport — most farmers use phones)
- Feature is usable in low-bandwidth/offline scenarios where applicable (PWA considerations)

---

## DoD Level 2: Sprint Done

A Sprint is considered **Done** when ALL user stories in the Sprint Goal are individually Done **AND**:

- Sprint Review has been conducted and a live demo was presented to the "client" (instructors)
- Sprint Retrospective has been held and action items are logged
- Sprint Backlog is updated; incomplete stories are re-estimated and moved to the next Sprint
- Burndown chart reflects actual progress
- All code is deployed to the shared development/staging environment and accessible to all team members
- No critical (P0/P1) bugs remain open

---

## DoD Level 3: Final Product Done

The product is **Done** for final submission when:

- All Sprint DoDs have been met
- Application is deployed to a live cloud environment (Vercel / Heroku / AWS free tier) **when deployment is in scope (typically Sprint 3–4)**
- Unit test coverage ≥ 80% across **business-logic modules** (Vitest in the app; Jest contract suite for shared financial logic in `docs/sprint-1/tdd/` counts toward critical calculations)
- CI/CD pipeline runs automatically on every push to `main` **when CI is configured**
- README includes: project overview, setup instructions, environment variables guide, and deployment steps
- OpenAPI / Swagger documentation exists for **all** API endpoints **once a backend API exists**
- RBAC is functional: Farmer and Admin roles have correct access restrictions **once RBAC is implemented**
- PWA offline capability is working (service worker caches critical assets) **once PWA is implemented (course expectation for Farm Budget global standards)**
- All ethical/data privacy considerations are documented (no PII stored without justification)
- Final demo video or live presentation is ready

---

## Quality Gates (Non-Negotiable)

These are hard blocks — a PR **cannot** be merged if any of these fail:


| Gate          | Tool | Threshold |
| ------------- | ---- | --------- |
| Linting       | ESLint | 0 errors |
| Formatting    | Prettier | 0 violations |
| Unit Tests    | **Vitest** (FarmBudget app) **and** **Jest** (`docs/sprint-1/tdd/` financial contract) | All pass in CI |
| Code Coverage | Vitest / Jest `--coverage` | ≥ 80% on **business-logic** modules (see [`alignment.md`](../alignment.md)) |
| Build         | Vite | 0 build errors |
| CI Pipeline   | GitHub Actions (or agreed equivalent) | All checks green |


---

## What Does NOT Count as Done

To avoid ambiguity, the following states explicitly mean **Not Done**:

- "It works on my machine" (must run in the shared environment)
- "The tests pass locally" (must pass in CI)
- "I'll write the tests after" (TDD is required for critical components)
- "The PR is open" (must be reviewed, approved, and merged)
- "The feature works but I haven't updated the board"

---

## Team Agreement

This DoD was agreed upon by the entire team during Sprint 0. Changes to this document require a team vote and must be documented in the Sprint Retrospective.


| Name             | Role                       | Scrum Role|
| ---------------- | -------------------------- | -------- |
| Kweku-Abeiku     | Frontend Developer/ PWA / Mobile Dev | Scrum Master|
| Nana Yaw         | Frontend / DB / Deployment | Developer|
| Patrick          | Backend / Database         | Product Owner|
| Annaliese        | Security (RBAC)            | Developer |
| Betty            | Security (RBAC)            | Developer |


> **Last Updated:** Sprint 0 — aligned with `docs/alignment.md` and vertical-slice doc

