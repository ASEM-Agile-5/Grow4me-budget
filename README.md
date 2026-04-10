# GrowForMe Farm Budget — project documentation

**Single documentation root** for ICS 532 (*Agile Software Engineering Methods*) — **GrowForMe Digital Agriculture**, Farm Budget track.

Use the [`docs/`](docs/) folder for anything graders, the Product Owner (instructors), or teammates should read: process (DoD), product (vertical slice), tests (TDD contract), and **placeholders** for later sprints.

> **Canonical doc index:** [`docs/README.md`](docs/README.md) (same structure as this file; links below target files under `docs/`.)

---

## Start here

| Read first | Purpose |
|------------|---------|
| [`docs/alignment.md`](docs/alignment.md) | Resolves SPA vs course brief vs Jest vs Vitest — **read before debating “contradictions.”** |
| [`docs/project/course-milestones.md`](docs/project/course-milestones.md) | Five-week map from the official project PDF (sprints, deliverables, artifacts). |
| [`docs/sprint-0/definition-of-done.md`](docs/sprint-0/definition-of-done.md) | Team **Definition of Done** (all levels + quality gates). |
| [`docs/sprint-1/feature-vertical-slice.md`](docs/sprint-1/feature-vertical-slice.md) | **FarmBudget** app: routes, data model, UX, tech stack. |
| [`docs/sprint-1/tdd/README.md`](docs/sprint-1/tdd/README.md) | Jest **TDD contract** for critical financial logic. |

---

## Folder map (by course sprint)

The numbering matches **Week 1 = Sprint 0** … **Week 5 = Sprint 4** in the course document.

| Folder | Course week | Theme (from brief) | Status |
|--------|-------------|---------------------|--------|
| [`docs/sprint-0/`](docs/sprint-0/) | Week 1 | Inception & foundation — DoD, backlog, tooling | Active |
| [`docs/sprint-1/`](docs/sprint-1/) | Week 2 | First functional layer — vertical slice, TDD | Active |
| [`docs/sprint-2/`](docs/sprint-2/) | Week 3 | Integration & UX | Placeholder |
| [`docs/sprint-3/`](docs/sprint-3/) | Week 4 | DevOps & production readiness | Placeholder |
| [`docs/sprint-4/`](docs/sprint-4/) | Week 5 | Final polish, research paper, viva | Placeholder |
| [`docs/project/`](docs/project/) | Cross-cutting | Course milestones, stakeholder notes | Active |

---

## Conventions

- **Product truths** for the running app live in **`docs/sprint-1/feature-vertical-slice.md`** (update that when the UI or model changes).
- **Process truths** live in **`docs/sprint-0/definition-of-done.md`** and **`docs/alignment.md`**.
- **Financial calculation contracts** live in **`docs/sprint-1/tdd/`** until extracted to a shared package.

---

## Scrum Master quick links

- Sprint planning: pull acceptance criteria from the vertical slice + DoD.
- Sprint review: demo against vertical-slice routes and DoD Level 2.
- Cross-team APIs (SCRUM of SCRUMs): document contracts under `docs/sprint-2/` or `docs/project/` when integration starts.

---

## Application code

- **Frontend:** [`frontend/`](frontend/)
- **Backend:** [`backend/`](backend/)

---

*Aligned with ASEM 2026 Final Project — Farm Budget module.*
