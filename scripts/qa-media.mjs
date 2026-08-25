/* Admin media-upload QA for the property prototype (dev server).
 * Run: node scripts/qa-media.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

// Create tiny real image + video fixture files for upload.
const dir = path.join(scriptDir, "..", "qa-shots");
fs.mkdirSync(dir, { recursive: true });
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
fs.writeFileSync(path.join(dir, "test-photo.png"), png);
fs.writeFileSync(path.join(dir, "test-video.mp4"), Buffer.from([0, 0, 0, 0]));

// Login
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.locator("#login-user").fill("abc123");
await page.locator("#login-pass").fill("qwerty12345");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("**/admin/add-project", { timeout: 8000 });

// Fill required fields + a name so the upload slug is derived.
await page.locator("#ap-name").fill("Media Test Heights");
await page.locator("#ap-category").selectOption("residential");
await page.locator("#ap-state").fill("Selangor");
await page.locator("#ap-area").fill("Petaling Jaya");
await page.locator("#ap-desc").fill("QA project to verify photo + video upload end to end.");

// Upload a photo through the image uploader.
await page.locator(".media-uploader__btn", { hasText: "Add photos" }).click();
await page.locator('input[type="file"][accept="image/*"]').setInputFiles(path.join(dir, "test-photo.png"));
await page.waitForSelector(".media-uploader__item", { timeout: 8000 });
check("Photo uploaded + listed", (await page.locator(".media-uploader__item").count()) === 1);
const photoThumb = await page.locator(".media-uploader__thumb").getAttribute("src");
check("Photo URL under /media/projects/", Boolean(photoThumb?.includes("/media/projects/")), photoThumb ?? "");

// Upload a video through the video uploader.
await page.locator(".media-uploader__btn", { hasText: "Add video" }).click();
await page.locator('input[type="file"][accept="video/*"]').setInputFiles(path.join(dir, "test-video.mp4"));
await page.waitForTimeout(1500);
check("Video uploaded + listed", (await page.locator(".media-uploader__item").count()) === 2);
check("Video item present", (await page.locator(".media-uploader__item", { hasText: "test-video.mp4" }).count()) === 1);

// Add a YouTube URL too.
await page.locator("#ap-videourl").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

// Save.
await page.getByRole("button", { name: "Save project" }).click();
await page.waitForSelector(".admin-success", { timeout: 9000 });
check("Project saved with media", await page.locator(".admin-success__title").isVisible());

// Verify the JSON file has photos + videos.
const jsonPath = path.join(scriptDir, "..", "src", "data", "projects.json");
const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const proj = json.projects.find((p) => p.slug === "media-test-heights");
check("project persisted with slug", Boolean(proj));
const hasUploadedPhoto = proj?.photos?.some((p) => p.includes("/media/projects/media-test-heights/"));
const hasLocalVideo = proj?.videos?.some((v) => v.type === "local" && v.url.includes("/media/projects/"));
const hasYoutube = proj?.videos?.some((v) => v.type === "youtube");
check("photos include uploaded file", Boolean(hasUploadedPhoto), JSON.stringify(proj?.photos));
check("videos include uploaded local file", Boolean(hasLocalVideo), JSON.stringify(proj?.videos));
check("videos include YouTube link", Boolean(hasYoutube));

// Verify physical file landed on disk.
const mediaDir = path.join(scriptDir, "..", "public", "media", "projects", "media-test-heights");
const diskPhoto = fs.existsSync(mediaDir);
check("media folder created on disk", diskPhoto);
const files = diskPhoto ? fs.readdirSync(mediaDir) : [];
check(
  "media files written to disk",
  files.some((f) => f.endsWith(".png")) && files.some((f) => f.endsWith(".mp4")),
  files.join(","),
);

// Reload the project detail page -> file served by Vite from public/.
await page.goto(BASE + "/projects/media-test-heights", { waitUntil: "networkidle" });
const imgSrc = await page.locator(".gallery img").first().getAttribute("src");
check("Detail page uses uploaded cover", imgSrc?.includes("/media/projects/media-test-heights/"), imgSrc ?? "");
check("Video tab present", (await page.locator(".detail-tab", { hasText: "Video" }).count()) > 0);

// Console errors
check("No console errors", errors.length === 0, errors.slice(0, 4).join(" | ") || "clean");

console.log(`\n=== SUMMARY: ${results.filter((r) => r.ok).length} passed, ${results.filter((r) => !r.ok).length} failed ===`);
await browser.close();
process.exit(results.some((r) => !r.ok) ? 1 : 0);
