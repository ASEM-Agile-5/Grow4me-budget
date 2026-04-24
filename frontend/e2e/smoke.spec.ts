import { test, expect } from "@playwright/test";

test("login page shows sign-in", async ({ page }) => {
  await page.goto("/login");
  // Title is a styled <div>, not a semantic heading
  await expect(page.getByText("Welcome back", { exact: true })).toBeVisible();
  await expect(page.getByText("Sign in to your farm dashboard")).toBeVisible();
});

test("root without session redirects to login", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/login", { timeout: 30_000 });
  await expect(page).toHaveURL(/\/login$/);
});

test("unknown path shows 404", async ({ page }) => {
  await page.goto("/__e2e_not_a_route_404__");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("Oops! Page not found")).toBeVisible();
});
