# Course milestones — ICS 532 Final Project (ASEM 2026)

Condensed from the official **Final Project Description** (*GrowForMe Digital Agriculture Ecosystem*).  
**Project period:** five weeks. **Delivery:** working prototype, research paper, individual viva.

---

## Weekly sprint map


| Week | Sprint       | Theme                         | Main activities                                                                                           | Typical artifacts                                 |
| ---- | ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1    | **Sprint 0** | Inception & foundation        | Project selection, **Definition of Done**, Git, board (Jira/Trello), CI skeleton, initial product backlog | Product backlog, board, team contract, tech stack |
| 2    | **Sprint 1** | First functional layer        | Core functionality, **vertical slice**, **TDD on critical components**                                    | Working prototype v0.1, sprint review             |
| 3    | **Sprint 2** | Integration & UX              | External services (e.g. mapping, payment mock), responsive UI from designs, refactor / tech debt          | Integrated prototype v0.2, burndown, code review  |
| 4    | **Sprint 3** | DevOps & production readiness | CI/CD, cloud deploy, monitoring & logging                                                                 | Deployed app v1.0 RC, monitoring                  |
| 5    | **Sprint 4** | Final polish & research       | Bugs, testing, docs; **ACM research paper**; **individual viva**                                          | Final v1.0, paper, viva                           |


> Note: Course table labels sprints 0–4 across five weeks; folder names here match: `docs/sprint-0` … `docs/sprint-4`.

---

## Farm Budget — global standards (project end state)

From the project brief, the Farm Budget module is expected to evolve toward:

- Robust **CRUD** with validation  
- **PWA** traits for offline / low connectivity  
- **RBAC** (farmer vs administrator)  
- **TDD** on financial calculations

Not all of these are mandatory in Sprint 1; phase them using `[../alignment.md](../alignment.md)`.

---

## Dependencies (SCRUM of SCRUMs)

Farm Budget is **depended on** by Credit Scoring (historical budget data). Coordinate API or data contracts with sibling teams as features stabilize — capture agreements under `sprint-2/` or `project/` when ready.

---

## Assessment snapshot (for documentation scope)


| Component               | Weight (of project grade) | Documentation implication                              |
| ----------------------- | ------------------------- | ------------------------------------------------------ |
| Software product (team) | 20%                       | Architecture, code quality, DevOps, UX, docs           |
| ACM research paper      | 10%                       | Agile practice evaluation (e.g. TDD, pair programming) |
| Individual viva         | 10%                       | Process reflection, technical defence                  |


---

*For the full rubric and stakeholder rules, refer to the PDF distributed in class.*