/**
 * Dev-only middleware for the admin area.
 *  - POST /__admin/projects  → append a project record to src/data/projects.json
 *  - POST /__admin/media     → save uploaded photo/video files (base64 JSON) into
 *                              public/media/projects/<slug>/ and return the public
 *                              URLs (image) and YouTube/local video entries.
 *
 * This is a tiny local-file shim so the prototype works end to end during
 * `npm run dev`. It is NOT a database or backend. It registers only in the
 * Vite dev server (not the production build); the admin service falls back to
 * manual/copy-paste paths when unavailable.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { Plugin } from "vite";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v"]);

/** Sanitize a filename into URL-safe characters. */
function safeName(name: string): string {
  // Keep the extension, replace the base with safe chars.
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${base || "file"}${ext}`;
}

export function projectWritePlugin(): Plugin {
  // Plugin lives at the project root.
  const projectsPath = fileURLToPath(
    new URL("./src/data/projects.json", import.meta.url),
  );
  const propertiesPath = fileURLToPath(
    new URL("./src/data/properties.json", import.meta.url),
  );
  const mediaRoot = fileURLToPath(new URL("./public/media", import.meta.url));

  return {
    name: "admin-project-write",
    configureServer(server) {
      // ---- Media upload (base64 JSON transport) ----
      server.middlewares.use("/__admin/media", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          try {
            const body = Buffer.concat(chunks);
            // ~60MB cap (base64 inflates by ~33%).
            if (body.length > 80 * 1024 * 1024) {
              res.statusCode = 413;
              res.end("payload too large");
              return;
            }

            const payload = JSON.parse(body.toString("utf8"));
            const slug = payload.slug;
            const scope = payload.scope === "properties" ? "properties" : "projects";
            const files = Array.isArray(payload.files) ? payload.files : [];
            if (!slug) {
              res.statusCode = 400;
              res.end("slug is required");
              return;
            }

            const dir = path.join(mediaRoot, scope, safeName(slug));
            mkdirSync(dir, { recursive: true });

            const saved: { file: string; url: string; kind: "image" | "video" }[] = [];
            for (const f of files) {
              if (!f || typeof f.data !== "string" || typeof f.name !== "string") {
                continue;
              }
              const name = safeName(f.name);
              const ext = path.extname(name).toLowerCase().replace(".", "");
              const kind = IMAGE_EXT.has(ext) ? "image" : VIDEO_EXT.has(ext) ? "video" : null;
              if (!kind) {
                continue;
              }
              const buf = Buffer.from(f.data, "base64");
              const fileName = `${Date.now()}-${name}`;
              writeFileSync(path.join(dir, fileName), buf);
              saved.push({
                file: name,
                url: `/media/${scope}/${slug}/${fileName}`,
                kind,
              });
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                ok: true,
                slug,
                files: saved,
                folder: `/media/${scope}/${slug}/`,
              }),
            );
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err instanceof Error ? err.message : err));
          }
        });
      });

      // ---- Property record write ----
      server.middlewares.use("/__admin/properties", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const incoming = JSON.parse(body);
            if (!incoming || typeof incoming.slug !== "string") {
              res.statusCode = 400;
              res.end("invalid payload");
              return;
            }

            const current = JSON.parse(readFileSync(propertiesPath, "utf8"));
            const properties = Array.isArray(current.properties) ? current.properties : [];
            if (properties.some((p: { slug: string }) => p.slug === incoming.slug)) {
              res.statusCode = 409;
              res.end("duplicate slug");
              return;
            }

            properties.push(incoming);
            writeFileSync(
              propertiesPath,
              JSON.stringify({ ...current, properties }, null, 2) + "\n",
              "utf8",
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, property: incoming }));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err instanceof Error ? err.message : err));
          }
        });
      });

      // ---- Project record write ----
      server.middlewares.use("/__admin/projects", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const incoming = JSON.parse(body);
            if (!incoming || typeof incoming.slug !== "string") {
              res.statusCode = 400;
              res.end("invalid payload");
              return;
            }

            const current = JSON.parse(readFileSync(projectsPath, "utf8"));
            const projects = Array.isArray(current.projects) ? current.projects : [];
            if (projects.some((p: { slug: string }) => p.slug === incoming.slug)) {
              res.statusCode = 409;
              res.end("duplicate slug");
              return;
            }

            projects.push(incoming);
            // Preserve a trailing newline; normalise to the file's line endings.
            writeFileSync(
              projectsPath,
              JSON.stringify({ ...current, projects }, null, 2) + "\n",
              "utf8",
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, project: incoming }));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err instanceof Error ? err.message : err));
          }
        });
      });
    },
  };
}
