// RUNTAINER server — serves the built UI and the Docker API bridge.
// Auto-detects Docker; falls back to demo mode so the UI is always explorable.

import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { demo } from "./demo.js";
import { createRealBackend, getJob, RUNTAINER_HOME } from "./docker.js";
import { registries, marketplaceApps, linuxBaseImages, oneClickApps } from "./catalog.js";
import { createMigrationBundle, parseBundle } from "./migration.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 3000;
const VERSION = "1.0.0";

async function pickBackend() {
  if (process.env.RUNTAINER_DEMO === "1") return demo;
  const sock = process.env.DOCKER_HOST ? null : "/var/run/docker.sock";
  try {
    if (sock && !fs.existsSync(sock)) return demo;
    const real = createRealBackend(sock || undefined);
    await Promise.race([real.ping(), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 2500))]);
    console.log("[runtainer] Docker socket found — live mode");
    return real;
  } catch {
    console.log("[runtainer] Docker not reachable — demo mode (set RUNTAINER_DEMO=0 to force)");
    return demo;
  }
}

const backend = await pickBackend();

const app = express();
app.use(express.json({ limit: "10mb" }));
const upload = multer({ dest: path.join(RUNTAINER_HOME, "uploads") });

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ error: e.message }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, version: VERSION, mode: backend.kind, demo: backend.kind === "demo" });
});

app.get("/api/overview", wrap(async (req, res) => res.json(await backend.overview())));
app.get("/api/containers", wrap(async (req, res) => res.json(await backend.containers())));
app.post("/api/containers/:id/action", wrap(async (req, res) => {
  const action = req.body?.action;
  if (!["start", "stop", "restart", "remove"].includes(action)) return res.status(400).json({ error: "bad action" });
  res.json(await backend.containerAction(req.params.id, action));
}));
app.get("/api/images", wrap(async (req, res) => res.json(await backend.images())));
app.get("/api/networks", wrap(async (req, res) => res.json(await backend.networks())));
app.get("/api/volumes", wrap(async (req, res) => res.json(await backend.volumes())));

app.get("/api/marketplace", (req, res) => res.json({ registries, apps: marketplaceApps, linux: linuxBaseImages }));

app.post("/api/deploy", wrap(async (req, res) => {
  const spec = req.body || {};
  if (!spec.image) return res.status(400).json({ error: "image is required" });
  spec.name = (spec.name || spec.image.split("/").pop().split(":")[0]).replace(/[^a-zA-Z0-9_.-]/g, "-");
  const result = await backend.deployImage(spec);
  res.json({ ok: true, container: result });
}));

app.get("/api/git/containers", wrap(async (req, res) => res.json(await backend.gitContainers())));
app.post("/api/git/deploy", wrap(async (req, res) => {
  const spec = req.body || {};
  if (!spec.repoUrl || !/^https?:\/\/.+/.test(spec.repoUrl)) return res.status(400).json({ error: "a valid https repository URL is required" });
  const job = backend.gitDeploy(spec);
  res.json({ ok: true, jobId: job.id });
}));
app.get("/api/git/jobs/:id", (req, res) => {
  const job = backend.kind === "demo" ? demo.gitJob(req.params.id) : getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "not found" });
  res.json(job);
});

app.get("/api/apps", (req, res) => res.json(oneClickApps));
app.post("/api/apps/:id/deploy", wrap(async (req, res) => {
  const a = oneClickApps.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "unknown app" });
  const job = backend.appDeploy(a);
  res.json({ ok: true, jobId: job.id });
}));

app.post("/api/migration/export", wrap(async (req, res) => {
  const result = await createMigrationBundle(backend, req.body || {});
  res.json({ ok: true, ...result });
}));
app.get("/api/migration/download/:file", (req, res) => {
  const f = path.basename(req.params.file);
  const p = path.join(RUNTAINER_HOME, "exports", f);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "not found" });
  res.download(p, f);
});
app.post("/api/migration/import", upload.single("bundle"), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "no bundle uploaded" });
  try {
    const manifest = parseBundle(req.file.path);
    res.json({ ok: true, manifest, note: "Bundle verified. Run restore.sh inside it to rebuild the containers on this host." });
  } catch (e) {
    res.status(400).json({ error: `invalid bundle: ${e.message}` });
  } finally {
    fs.rmSync(req.file.path, { force: true });
  }
}));

// Serve built frontend
const dist = path.join(ROOT, "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[runtainer] v${VERSION} listening on http://localhost:${PORT} (${backend.kind} mode)`);
});
