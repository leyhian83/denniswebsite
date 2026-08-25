/* Headless QA verification of the property prototype (dev server).
 * Run: node scripts/qa-verify.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const results = [];
const screenshots = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

async function goto(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
}

// ---- Home page ----
await goto("/");
check("Home renders hero h1", (await page.locator("h1").count()) > 0,
  await page.locator("h1").first().textContent().catch(() => "none"));
check("Home has Browse Properties CTA", await page.getByRole("link", { name: "Browse Properties" }).count() > 0);
check("Home featured properties grid", (await page.locator(".property-card").count()) >= 3,
  `${await page.locator(".property-card").count()} cards`);
check("Home has Explore by Area chips", (await page.locator(".area-chip").count()) >= 5,
  `${await page.locator(".area-chip").count()} chips`);
check("Home has Contact CTA", await page.getByRole("link", { name: /WhatsApp/ }).first().count() > 0);
await page.screenshot({ path: "qa-shots/01-home.png", fullPage: true });
screenshots.push("01-home.png");

// ---- Subsale -> Residential -> Condominium ----
await goto("/subsale/residential/condominium");
check("Condominium heading", (await page.locator("h1").textContent()).includes("Condominium"));
const condoCount = await page.locator(".property-card").count();
check("Condominium listings shown", condoCount > 0, `${condoCount} cards`);
await page.goto(BASE + "/properties/the-meridian-residence", { waitUntil: "networkidle" });
check("Property detail title", (await page.locator("h1").textContent()).includes("Meridian"));
check("Detail gallery present", (await page.locator(".gallery").count()) > 0);
check("Detail specs present", (await page.locator(".detail-spec").count()) > 0);
check("WhatsApp prefilled link", true,
  await page.locator('.btn--whatsapp').first().getAttribute("href").then(h => h ? h.slice(0, 60) : "none"));
await page.screenshot({ path: "qa-shots/02-property-detail.png", fullPage: true });
screenshots.push("02-property-detail.png");

// ---- Areas -> Kuala Lumpur -> Mont Kiara ----
await goto("/areas/kuala-lumpur/mont-kiara");
check("Area detail heading Mont Kiara", (await page.locator("h1").textContent()).includes("Mont Kiara"));
check("Area detail has listings", (await page.locator(".property-card").count()) > 0);
await page.screenshot({ path: "qa-shots/03-area-detail.png", fullPage: true });
screenshots.push("03-area-detail.png");

// ---- Search + filters ----
await goto("/subsale");
await page.locator('input[type="search"]').fill("Shah Alam");
await page.waitForTimeout(400);
const searchCount = await page.locator(".property-card").count();
check("Search 'Shah Alam' filters results", searchCount > 0 && searchCount < 12, `${searchCount} results`);
await page.locator('input[type="search"]').fill("zzzz-nonexistent");
await page.waitForTimeout(400);
check("Empty state on no match", (await page.locator(".empty-state").count()) > 0,
  await page.locator(".empty-state__title").textContent().catch(() => "none"));
await page.locator('input[type="search"]').fill("");

// ---- Projects ----
await goto("/projects");
check("Projects page renders", (await page.locator(".project-card").count()) > 0,
  `${await page.locator(".project-card").count()} project cards`);
await goto("/projects/ardenia-towers-bukit-bintang");
check("Project detail name", (await page.locator("h1").textContent()).includes("Ardenia"));
check("Project has facilities", (await page.locator(".detail-features").count()) > 0);
await page.screenshot({ path: "qa-shots/04-project-detail.png", fullPage: true });
screenshots.push("04-project-detail.png");

// ---- Invalid route ----
await goto("/does/not/exist");
check("404 for invalid route", (await page.locator("h1").textContent()).toLowerCase().includes("not found")
  || (await page.locator(".notfound").count()) > 0);

// ---- Contact form validation + submit ----
await goto("/contact");
await page.getByRole("button", { name: "Submit Enquiry" }).click();
check("Contact form shows validation errors", (await page.locator(".contact-form__error").count()) >= 3,
  `${await page.locator(".contact-form__error").count()} errors`);
await page.locator("#cf-name").fill("Test User");
await page.locator("#cf-phone").fill("0123456789");
await page.locator("#cf-email").fill("test@example.com");
await page.locator("#cf-subject").fill("The Meridian Residence");
await page.locator("#cf-message").fill("Hi, I would like more details.");
await page.getByRole("button", { name: "Submit Enquiry" }).click();
await page.waitForSelector(".contact-form__success", { timeout: 5000 });
check("Contact form simulated success", true);
await page.screenshot({ path: "qa-shots/05-contact-success.png" });
screenshots.push("05-contact-success.png");

// ---- Mobile viewport ----
await page.setViewportSize({ width: 390, height: 844 });
await goto("/");
check("Mobile menu toggle visible", (await page.locator(".header__menu-toggle").isVisible()));
await page.locator(".header__menu-toggle").click();
check("Mobile menu opens", await page.locator(".mobile-menu.is-open").isVisible());
await page.locator(".mobile-menu__link").first().click();
check("Mobile menu navigation works", !(await page.locator(".mobile-menu.is-open").isVisible()));
await page.screenshot({ path: "qa-shots/06-mobile-home.png", fullPage: true });
screenshots.push("06-mobile-home.png");

await goto("/subsale");
await page.locator(".listing-toolbar__filters-btn").waitFor({ state: "visible", timeout: 8000 });
check(
  "Mobile 'Filters' button visible",
  await page.locator(".listing-toolbar__filters-btn").isVisible(),
);
await page.locator(".listing-toolbar__filters-btn").click();
check("Mobile filter sheet opens", await page.locator(".filter-sheet.is-open").isVisible());
await page.screenshot({ path: "qa-shots/07-mobile-filters.png" });
screenshots.push("07-mobile-filters.png");

// ---- Console errors ----
check("No console errors", errors.length === 0, errors.slice(0, 5).join(" | ") || "clean");

console.log("\n=== SUMMARY ===");
const pass = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok).length;
console.log(`${pass} passed, ${fail} failed`);
console.log("Screenshots:", screenshots.join(", "));

await browser.close();
process.exit(fail > 0 ? 1 : 0);
