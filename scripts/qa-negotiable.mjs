/* QA for the price-negotiable label + filter.
 * Run: node scripts/qa-negotiable.mjs
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

// --- Subsale listing: count of available/reserved records ---
await page.goto("http://localhost:5173/subsale", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const allCards = await page.locator(".property-card").count();
check("All cards render", allCards > 0, `${allCards} cards`);

// 5 records are marked negotiable -> labels only on those.
const negotiableLabels = await page.locator(".property-card__negotiable").count();
check("Negotiable labels shown", negotiableLabels === 5, `${negotiableLabels} shown`);
check("Not all cards are labelled", negotiableLabels < allCards, `${negotiableLabels}/${allCards}`);

// The pricing <select> lives in the desktop filter sidebar (the mobile sheet
// also renders a duplicate, so scope to .filter-sidebar).
const negotiableSelect = page
  .locator(".filter-sidebar .filter-group", { has: page.locator("#f-negotiable") })
  .locator("select");

// --- Filter: Negotiable ---
await negotiableSelect.selectOption("negotiable");
await page.waitForTimeout(400);
const filteredNegotiable = await page.locator(".property-card").count();
check("Negotiable filter -> 5 results", filteredNegotiable === 5, `${filteredNegotiable}`);
const labelledAfter = await page.locator(".property-card__negotiable").count();
check("All negotiate-filtered cards labelled", labelledAfter === filteredNegotiable);

// --- Filter: Non-negotiable ---
await negotiableSelect.selectOption("non-negotiable");
await page.waitForTimeout(400);
const nonNeg = await page.locator(".property-card").count();
check("Non-negotiable filter -> remaining", nonNeg === allCards - 5, `${nonNeg}`);
check("No negotiate labels in non-negotiable view",
  (await page.locator(".property-card__negotiable").count()) === 0);

// --- Reset / Any ---
await negotiableSelect.selectOption("");
await page.waitForTimeout(400);
check("Pricing Any restores full list",
  (await page.locator(".property-card").count()) === allCards);

// --- Detail page shows the label on a negotiable property ---
await page.goto("http://localhost:5173/properties/the-meridian-residence", { waitUntil: "networkidle" });
check("Detail sidebar shows Negotiable",
  (await page.locator(".detail-sidebar__price-negotiable").count()) > 0);

// --- Detail page has NO label on a non-negotiable property ---
await page.goto("http://localhost:5173/properties/serenia-towers-klcc", { waitUntil: "networkidle" });
check("Non-negotiable detail has no label",
  (await page.locator(".detail-sidebar__price-negotiable").count()) === 0);

// --- Mobile filter sheet includes Pricing ---
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5173/subsale", { waitUntil: "networkidle" });
await page.locator(".listing-toolbar__filters-btn").click();
check("Mobile sheet has Pricing select",
  (await page.locator("#f-negotiable").count()) > 0);

check("No console errors", errors.length === 0, errors.slice(0, 4).join(" | ") || "clean");

console.log(`\n=== SUMMARY: ${results.filter((r) => r.ok).length} passed, ${results.filter((r) => !r.ok).length} failed ===`);
fs.writeFileSync(path.join(scriptDir, "..", "qa-negotiable-result.txt"), results.map((r) => `${r.ok ? "PASS" : "FAIL"} ${r.name} ${r.detail}`).join("\n"));
await browser.close();
process.exit(results.some((r) => !r.ok) ? 1 : 0);
