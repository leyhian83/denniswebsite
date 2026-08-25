/**
 * Dev-only middleware that lets the admin "add project" form actually write
 * to src/data/projects.json while running `npm run dev`.
 *
 * This is NOT a database or a backend server — it's a tiny local-file write
 * shim so the prototype feature works end to end. It is registered only in
 * the Vite dev server (not the production build), and the admin service falls
 * back to a copy-and-paste path when it is unavailable.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

export function projectWritePlugin(): Plugin {
  // Plugin lives at the project root, so the data file is ./src/data/projects.json.
  const projectsPath = fileURLToPath(
    new URL("./src/data/projects.json", import.meta.url),
  );

  return {
    name: "admin-project-write",
    configureServer(server) {
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
