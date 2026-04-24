# How we test the Farm Budget (simple overview)

This page explains the **tools** we use to check quality, in **plain language** first. You do not need a programming background.  

**For exact click-by-click steps to run everything**, use [`TESTING_STEP_BY_STEP.md`](TESTING_STEP_BY_STEP.md). **For real outputs from a machine run**, use [`TEST_RESULTS.md`](TEST_RESULTS.md).

---

## Why we do not use only one tool

A farm budget app has different kinds of risk: wrong **numbers** for a farmer, a screen that does not **load** when they expect it, or a change that **breaks** a small but important part of the code. No single product checks all of that the same way. So we use **several** helpers, each good at one kind of check.

---

## ESLint

**What it is:** ESLint is a **linter**—a helper that reads the **text** of code (like a grammar checker for programming) and flags things that are usually **mistakes**, **unsafe patterns**, or team **style** rules so everyone writes things the same way.

**What it does:** It walks through files and can warn or fail the check when it sees patterns that often lead to bugs, confusion, or inconsistent style.

**Why we used it for this project:** Our app has a lot of **React/TypeScript** in the `frontend` folder. We use ESLint on the **automation** path to keep our **shared helpers** and **test files** clean and predictable—those are the building blocks the rest of the app relies on, including behaviour that matters in **poor network** conditions. We do **not** use ESLint on every file in the app in every automated run yet, because a large part of the UI is still being refined; focusing ESLint on the “library” and test code keeps the main **quality check** **honest and passing** while the team keeps improving the rest.

---

## Vitest

**What it is:** Vitest is a **test runner** for small **unit tests**—it runs many tiny checks in memory, very **quickly**, without opening a real browser for each one.

**What it does:** You describe “when I give the code this **input**, I expect this **output**,” and Vitest runs those cases and reports pass or fail.

**Why we used it for this project:** Farm Budget is meant to be useful even when the connection is **unreliable**. The code in `src/lib` includes things like an **offline queue** and a **query cache**—the kinds of details that are easy to break with a small change. Unit tests with Vitest let us **re-check** that behaviour in **seconds**, many times, without clicking through the whole app. That fits our need for **fast feedback** during a short sprint.

---

## Vite

**What it is:** Vite is a **build tool** for the frontend. It is what we use in development, and the same build step produces the **version** of the app you would **deploy** (a production “bundle”).

**What it does for testing:** A **build** is not a “test you write,” but it is a hard check: *does the project still **turn into a working app package**?* If the build **fails**, the product cannot be shipped, no matter how many small tests pass.

**Why we used it for this project:** GrowForMe needs a **stable, shippable** web app. Running a **production build** in our workflow catches problems that only show up when the whole app is **assembled**—for example, broken links between parts of the system that unit tests do not see on their own.

---

## Jest (and the TDD course fol+der)

**What it is:** Jest is a **test runner and framework** (especially common in the JavaScript world) that runs **test cases** you write and, in our TDD area, can report how much of the business logic is **covered** by those tests.

**What it does:** In our project, a **separate** small folder (under `docs/sprint-1/tdd/`) holds the **pure budget logic**: calculator, summary, input validation—**without** the React pages and **without** the server. Jest runs tests against those **modules** the same way, every time.

**Why we used it for this project:** The course and the Farm Budget product both care that **money math and rules** are right. That is a **reputation and trust** issue for farmers, not a “nice to have.” Keeping that logic in one place and testing it with **Jest** matches **test-driven development (TDD)** in spirit: the rules are **repeatedly verified**, not just eyeballed. We also show **coverage** for those files so the team can see the logic is not “mostly untested.”

---

## Playwright

**What it is:** Playwright is a **browser automation** tool. A **real** browser (we use **Chromium**) can open the app, click, navigate, and read what appears on the screen, like a very fast, repeatable **user**—not like a person, but the same **idea** as a manual “smoke” check.

**What it does for us:** It runs a **short** set of end-to-end checks: for example, that the **login** page shows the right text, that visiting the **home** route without a session **sends you to login**, and that a **fake URL** shows a **404** page. It starts the app the same way a developer would for local work so the test matches **real** loading behaviour.

**Why we used it for this project:** Unit tests are great for **insides** of the code, but they do not prove the **wiring** is right: routes, what the user **sees**, and that the app **boots** in a browser. Playwright gives **confidence** on those “whole path” details without our team re-testing every page by hand before each review. We keep the list **small** on purpose, because this kind of test is **slower** and can need more care than tiny unit tests.

---

## Django’s test system

**What it is:** Django is our **back-end framework** (Python) for the API, database, and business rules on the **server**. The framework includes its own way to run **server-side** tests: `manage.py test` discovers test files the team has written in the back-end code.

**What it does for us:** Those tests check the **server** and **database** world—things a browser or a JavaScript test running on the **client** will not see, such as data rules and how the **API** behaves with a real data layer.

**Why we used it for this project:** A serious Farm Budget has to be **right** in the place where data is **stored and rules are enforced** on the server. Django tests are the standard, peer-reviewed way to check that. They need a real **database** (we use **PostgreSQL** the way the project is set up), so a teammate can **skip** that step in the combined script if their computer is not set up **yet**—and we **record** that in the test log so everyone is honest about what was run.

---

## How the pieces work together (no jargon)

- **Jest** on the **business math and validation** in one small area (fast, focused, TDD style).  
- **Vitest** on **front-end helper** behaviour (fast, for offline and cache type logic).  
- **ESLint** to keep the **automation** parts of the front end **tidy and safer**.  
- **Vite build** to prove the **full app** still **packages** correctly.  
- **Playwright** for a **handful** of “does the app behave like a product in a browser?” checks.  
- **Django** tests for the **server and database** side, when the environment is ready.  

We did not try to automate every screen or every line of code. We **prioritised** the risks the course and the product call out: **correct money behaviour**, **reliable** helper logic for real-world use, a **shippable** app, a **livable** browser check, and a **serious** path to full-stack quality.

---

## Where the “how to run it” details are

**Commands, folders, and scripts** (what to type and where) live in [`TESTING_STEP_BY_STEP.md`](TESTING_STEP_BY_STEP.md). This overview is only **names and meaning** so anyone can read it without sitting at a computer.

**Evidence** from a real run (command output, pass/fail) is in [`TEST_RESULTS.md`](TEST_RESULTS.md).  

**Splitting the work** between people is in [`TESTING_TWO_TESTERS.md`](TESTING_TWO_TESTERS.md).
