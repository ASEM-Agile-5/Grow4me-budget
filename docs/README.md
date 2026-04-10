# GrowForMe Farm Budget — project documentation

**Single documentation root** for ICS 532 (*Agile Software Engineering Methods*) — **GrowForMe Digital Agriculture**, Farm Budget track.

Use this folder for anything graders, the Product Owner (instructors), or teammates should read: process (DoD), product (vertical slice), tests (TDD contract), and **placeholders** for later sprints.

---

## Start here


| Read first                                                                 | Purpose                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `[alignment.md](alignment.md)`                                             | Resolves SPA vs course brief vs Jest vs Vitest — **read before debating “contradictions.”** |
| `[project/course-milestones.md](project/course-milestones.md)`             | Five-week map from the official project PDF (sprints, deliverables, artifacts).             |
| `[sprint-0/definition-of-done.md](sprint-0/definition-of-done.md)`         | Team **Definition of Done** (all levels + quality gates).                                   |
| `[sprint-1/feature-vertical-slice.md](sprint-1/feature-vertical-slice.md)` | **FarmBudget** app: routes, data model, UX, tech stack.                                     |
| `[sprint-1/tdd/README.md](sprint-1/tdd/README.md)`                         | Jest **TDD contract** for critical financial logic.                                         |


---

## Folder map (by course sprint)

The numbering matches **Week 1 = Sprint 0** … **Week 5 = Sprint 4** in the course document.


| Folder                   | Course week   | Theme (from brief)                             | Status      |
| ------------------------ | ------------- | ---------------------------------------------- | ----------- |
| `[sprint-0/](sprint-0/)` | Week 1        | Inception & foundation — DoD, backlog, tooling | Active      |
| `[sprint-1/](sprint-1/)` | Week 2        | First functional layer — vertical slice, TDD   | Active      |
| `[sprint-2/](sprint-2/)` | Week 3        | Integration & UX                               | Placeholder |
| `[sprint-3/](sprint-3/)` | Week 4        | DevOps & production readiness                  | Placeholder |
| `[sprint-4/](sprint-4/)` | Week 5        | Final polish, research paper, viva             | Placeholder |
| `[project/](project/)`   | Cross-cutting | Course milestones, stakeholder notes           | Active      |


---

## Conventions

- **Product truths** for the running app live in `**sprint-1/feature-vertical-slice.md`** (update that when the UI or model changes).
- **Process truths** live in `**sprint-0/definition-of-done.md`** and `**alignment.md`**.
- **Financial calculation contracts** live in `**sprint-1/tdd/`** until extracted to a shared package.

---

## Scrum Master quick links

- Sprint planning: pull acceptance criteria from the vertical slice + DoD.
- Sprint review: demo against vertical-slice routes and DoD Level 2.
- Cross-team APIs (SCRUM of SCRUMs): document contracts under `sprint-2/` or `project/` when integration starts.

---

*Aligned with ASEM 2026 Final Project — Farm Budget module.*