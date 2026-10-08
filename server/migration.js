// RUNTAINER migration — package git-backed containers (+ RUNTAINER itself)
// into a single .rtpack zip that restores everything on a new machine.

import { ZipArchive } from "archiver";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { RUNTAINER_HOME } from "./docker.js";

const APP_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function restoreScript(manifest) {
  const lines = manifest.containers.map((c) => {
    const env = Object.entries(c.env || {}).map(([k, v]) => `  --env ${k}=${JSON.stringify(v)} \\`).join("\n");
    return `
echo "==> Restoring ${c.name} (${c.repo} @ ${c.branch})"
git clone --depth 1 --branch "${c.branch}" "${c.repo}" "$WORKDIR/git/${c.name}" || git -C "$WORKDIR/git/${c.name}" pull
docker build -t "runtainer/git:${c.name}" "$WORKDIR/git/${c.name}"
docker network create "${c.network}" 2>/dev/null || true
docker rm -f "${c.name}" 2>/dev/null || true
docker run -d --name "${c.name}" \\
  --network "${c.network}" \\
${c.port ? `  -p ${c.port}:${c.containerPort} \\` : ""}
${env}
  --label runtainer.managed=git \\
  --label runtainer.git.repo="${c.repo}" \\
  --label runtainer.git.branch="${c.branch}" \\
  --restart unless-stopped \\
  "runtainer/git:${c.name}"
if [ -d "$BUNDLE/volumes/${c.name}" ]; then
  docker run --rm --volumes-from "${c.name}" -v "$BUNDLE/volumes/${c.name}":/restore alpine sh -c "cd / && tar xzf /restore/volume.tar.gz" || true
fi
echo "    ${c.name} restored → http://localhost:${c.port || "—"}"
`;
  }).join("\n");

  return `#!/usr/bin/env bash
# RUNTAINER migration restore script — generated ${manifest.createdAt}
# Restores ${manifest.containers.length} git-backed container(s) and installs RUNTAINER itself.
set -euo pipefail

BUNDLE="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="\${RUNTAINER_HOME:-$HOME/.runtainer}"
mkdir -p "$WORKDIR/git"

echo "RUNTAINER migration restore"
echo "==========================="

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found — installing..."
  curl -fsSL https://get.docker.com | sh
fi

# 1) Install RUNTAINER on this machine (the bundle always carries it)
if [ ! -d "$HOME/runtainer" ]; then
  cp -r "$BUNDLE/runtainer" "$HOME/runtainer"
  echo "RUNTAINER installed to ~/runtainer (cd ~/runtainer && ./install.sh to launch)"
else
  echo "RUNTAINER already present at ~/runtainer — skipping"
fi

# 2) Rebuild and run each git container in its own isolated network
${lines}

echo ""
echo "All done. Start RUNTAINER with:  cd ~/runtainer && npm start"
`;
}

/**
 * Create a migration bundle zip.
 * @param backend docker backend (real or demo)
 * @param opts { containerIds?: string[], includeVolumes: boolean, encrypt: boolean }
 */
export async function createMigrationBundle(backend, opts = {}) {
  const gitContainers = await backend.gitContainers();
  const selected = opts.containerIds?.length
    ? gitContainers.filter((c) => opts.containerIds.includes(c.id) || opts.containerIds.includes(c.name))
    : gitContainers;

  const manifest = {
    format: "runtainer-pack",
    version: 1,
    createdAt: new Date().toISOString(),
    host: (await backend.overview()).host,
    containers: selected.map((c) => ({
      name: c.name, repo: c.repo, branch: c.branch, commit: c.commit,
      network: c.network || `git-net-${c.name}`,
      port: c.port, containerPort: 3000, env: {},
      volumeNames: [],
    })),
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `runtainer-migration-${stamp}.rtpack`;
  const outPath = path.join(RUNTAINER_HOME, "exports", fileName);
  const output = fs.createWriteStream(outPath);
  const archive = new ZipArchive({ zlib: { level: 6 } });

  const done = new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
  });
  archive.pipe(output);

  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
  archive.append(restoreScript(manifest), { name: "restore.sh", mode: 0o755 });
  archive.append(
    "# RUNTAINER migration bundle\n\n1. Copy this file to the new machine's home folder.\n2. Unzip it:  unzip " + fileName + " -d runtainer-migration\n3. Run:  cd runtainer-migration && bash restore.sh\n\nThe bundle includes RUNTAINER itself, so the new machine does not need anything preinstalled except bash, git and curl.\n",
    { name: "README.txt" }
  );

  // Always ship RUNTAINER itself inside the bundle (source, minus heavy dirs)
  archive.directory(path.join(APP_ROOT, "server"), "runtainer/server");
  archive.directory(path.join(APP_ROOT, "src"), "runtainer/src");
  for (const f of ["package.json", "index.html", "vite.config.ts", "tailwind.config.js", "postcss.config.js", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "install.sh"]) {
    const p = path.join(APP_ROOT, f);
    if (fs.existsSync(p)) archive.file(p, { name: `runtainer/${f}` });
  }

  await archive.finalize();
  await done;
  const sizeMb = Math.round((fs.statSync(outPath).size / 1048576) * 100) / 100;
  return { file: fileName, path: outPath, sizeMb, containers: selected.length };
}

export function parseBundle(filePath) {
  // Read manifest.json straight out of the zip (`unzip` ships with any Linux host).
  const raw = execFileSync("unzip", ["-p", filePath, "manifest.json"]).toString("utf8");
  return JSON.parse(raw);
}
