/* Admin + restyle QA for the property prototype (dev server).
 * Run: node scripts/qa-admin.mjs
 * Requires: dev server on :5173, playwright + chromium installed.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const results = [];
let screenshots = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

async function goto(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
}

// ---------- Air restyle sanity (computed styles) ----------
await goto("/");
check(
  "Canvas is dark (body bg #0a0a0a)",
  (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) ===
    "rgb(10, 10, 10)",
  await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
);
check(
  "Hero headline uses Anton (compressed display)",
  (await page.evaluate(() => getComputedStyle(document.querySelector("h1")).fontFamily)).includes(
    "Anton",
  ),
);
check(
  "Hero headline is uppercase",
  (await page.evaluate(() => getComputedStyle(document.querySelector("h1")).textTransform)) ===
    "uppercase",
);
check(
  "Property cards are haze (#f5f5f5)",
  (await page.evaluate(
    () => getComputedStyle(document.querySelector(".property-card")).backgroundColor,
  )) === "rgb(245, 245, 245)",
);
check(
  "Primary button is whiteout on dark",
  (await page.evaluate(
    () => getComputedStyle(document.querySelector(".hero .btn--primary")).backgroundColor,
  )) === "rgb(255, 255, 255)",
);
await page.screenshot({ path: "qa-shots/air-01-home.png", fullPage: true });
screenshots.push("air-01-home.png");

// ---------- Login page ----------
await goto("/login");
check("Login page h1", (await page.locator("h1").textContent()).includes("desk"));
check("Login form fields present", (await page.locator("#login-user").count()) === 1
  && (await page.locator("#login-pass").count()) === 1);

// Wrong credentials
await page.locator("#login-user").fill("abc123");
await page.locator("#login-pass").fill("wrong-password");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForTimeout(300);
check(
  "Wrong credentials rejected",
  await page.locator(".login-form__error").isVisible(),
  await page.locator(".login-form__error").textContent().catch(() => "none"),
);
check("Still on /login after failure", page.url().endsWith("/login"));
await page.screenshot({ path: "qa-shots/air-02-login-error.png" });
screenshots.push("air-02-login-error.png");

// Correct credentials
await page.locator("#login-pass").fill("qwerty12345");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("**/admin/add-project", { timeout: 8000 });
check("Login redirects to /admin/add-project", page.url().endsWith("/admin/add-project"));

// ---------- Protected route (fresh session) ----------
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(BASE + "/admin/add-project", { waitUntil: "networkidle" });
await page2.waitForURL("**/login", { timeout: 8000 });
check("Protected route redirects to /login", page2.url().endsWith("/login"));
check(
  "Redirect preserves intended route",
  (await page2.evaluate(() => window.history.state?.usr?.from)) === "/admin/add-project",
);
await ctx2.close();

// ---------- Add a project end to end ----------
const projectName = "Sunway Test Heights";
await page.locator("#ap-name").fill(projectName);
await page.locator("#ap-developer").fill("Sunway QA Development Sdn Bhd");
await page.locator("#ap-category").selectOption("residential");
await page.locator("#ap-type").fill("condominium");
await page.locator("#ap-state").fill("Selangor");
await page.locator("#ap-area").fill("Subang Jaya / Sunway");
await page.locator("#ap-subarea").fill("Sunway South");
await page.locator("#ap-pricefrom").fill("620000");
await page.locator("#ap-priceto").fill("880000");
await page.locator("#ap-tenure").fill("Freehold");
await page.locator("#ap-completion").fill("2027-12");
await page.locator("#ap-status").selectOption("under-construction");
await page.locator("#ap-units").fill("1 Bedroom, 2 Bedrooms, 3 Bedrooms");
await page.locator("#ap-desc").fill(
  "QA test project. A fictional residential development used to verify the add-project flow writes to the local JSON data file.",
);
await page.locator("#ap-facilities").fill("Infinity Pool, Gym");
await page.getByRole("button", { name: "Save project" }).click();
await page.waitForSelector(".admin-success", { timeout: 8000 });
check("Add-project success panel", await page.locator(".admin-success__title").isVisible());
await page.screenshot({ path: "qa-shots/air-03-add-success.png", fullPage: true });
screenshots.push("air-03-add-success.png");

// New project on the Projects page (reload to pick up the JSON write)
await goto("/projects");
await page.waitForTimeout(400);
const newCard = page.locator(".project-card__title", { hasText: projectName });
check("New project appears on /projects", (await newCard.count()) > 0);

// New project detail page (dynamic route from the new record)
await goto("/projects/sunway-test-heights");
await page.waitForTimeout(400);
check("New project detail renders", (await page.locator("h1").textContent()).includes("Sunway Test"));
check("New project shows facilities", (await page.locator(".detail-features").count()) > 0);
await page.screenshot({ path: "qa-shots/air-04-new-project-detail.png", fullPage: true });
screenshots.push("air-04-new-project-detail.png");

// Duplicate slug rejected by middleware
await goto("/admin/add-project");
await page.locator("#ap-name").fill(projectName);
await page.locator("#ap-category").selectOption("residential");
await page.locator("#ap-state").fill("Selangor");
await page.locator("#ap-area").fill("Subang Jaya / Sunway");
await page.locator("#ap-desc").fill("Duplicate name test.");
await page.getByRole("button", { name: "Save project" }).click();
await page.waitForSelector(".admin-form__banner", { timeout: 6000 });
const dupErr = await page.locator(".admin-form__banner").textContent();
check("Duplicate project name rejected", dupErr.includes("already exists"), dupErr.trim());

// ---------- Logout ----------
await page.getByRole("button", { name: "Log out" }).click();
await page.waitForURL("**/login", { timeout: 6000 });
check("Logout returns to /login", page.url().endsWith("/login"));

// ---------- 404 ----------
await goto("/does/not/exist");
check("404 for invalid route", (await page.locator(".notfound").count()) > 0);
check(
  "404 shows poster display type",
  (await page.evaluate(() =>
    getComputedStyle(document.querySelector(".notfound__title")).fontFamily,
  )).includes("Anton"),
);

// ---------- Mobile 390px ----------
await page.setViewportSize({ width: 390, height: 844 });
await goto("/");
check("Mobile: menu toggle visible", await page.locator(".header__menu-toggle").isVisible());
await page.locator(".header__menu-toggle").click();
check("Mobile: menu opens", await page.locator(".mobile-menu.is-open").isVisible());
await page.screenshot({ path: "qa-shots/air-05-mobile-menu.png" });
screenshots.push("air-05-mobile-menu.png");
await page.locator(".mobile-menu__link").first().click();

await goto("/login");
await page.locator("#login-user").fill("abc123");
await page.locator("#login-pass").fill("qwerty12345");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("**/admin/add-project", { timeout: 8000 });
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
check("Mobile: no horizontal overflow on admin page", overflow <= 1, `overflow ${overflow}px`);
await page.screenshot({ path: "qa-shots/air-06-mobile-admin.png", fullPage: true });
screenshots.push("air-06-mobile-admin.png");

await goto("/subsale");
await page.locator(".listing-toolbar__filters-btn").waitFor({ state: "visible", timeout: 8000 });
await page.locator(".listing-toolbar__filters-btn").click();
check("Mobile: filter sheet opens", await page.locator(".filter-sheet.is-open").isVisible());
await page.screenshot({ path: "qa-shots/air-07-mobile-filters.png" });
screenshots.push("air-07-mobile-filters.png");

// ---------- Console errors ----------
check("No console errors", errors.length === 0, errors.slice(0, 5).join(" | ") || "clean");

console.log("\n=== SUMMARY ===");
const pass = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok).length;
console.log(`${pass} passed, ${fail} failed`);
console.log("Screenshots:", screenshots.join(", "));

await browser.close();
process.exit(fail > 0 ? 1 : 0);
